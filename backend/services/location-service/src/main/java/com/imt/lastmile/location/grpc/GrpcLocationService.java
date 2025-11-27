package com.imt.lastmile.location.grpc;

import com.google.protobuf.TimestampProto;
import com.google.protobuf.TimestampProto.Timestamp;
import com.imt.lastmile.location.domain.DriverTelemetryEntity;
import com.imt.lastmile.location.repo.DriverTelemetryRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lastmile.driver.DriverId;
import lastmile.driver.DriverProfile;
import lastmile.driver.DriverServiceGrpc;
import lastmile.driver.RoutePlan;
import lastmile.driver.RouteStop;
import lastmile.location.Ack;
import lastmile.location.DriverEta;
import lastmile.location.DriverEtaRequest;
import lastmile.location.DriverSnapshot;
import lastmile.location.DriverTelemetry;
import lastmile.location.LocationServiceGrpc;
import lastmile.matching.EvaluateDriverRequest;
import lastmile.matching.MatchingServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GrpcLocationService extends LocationServiceGrpc.LocationServiceImplBase {
  private static final Logger log = LoggerFactory.getLogger(GrpcLocationService.class);
  private static final Duration ROUTE_CACHE_TTL = Duration.ofMinutes(5);
  private static final Duration TRIGGER_REFRESH = Duration.ofMinutes(2);

  private final DriverTelemetryRepository repo;
  private final Map<String, CachedRoute> routeCache = new ConcurrentHashMap<>();
  private final Map<String, Integer> driverCapacityCache = new ConcurrentHashMap<>();
  private final Map<String, TriggerState> lastTriggerByStation = new ConcurrentHashMap<>();

  @GrpcClient("driver-service")
  private DriverServiceGrpc.DriverServiceBlockingStub driverClient;

  @GrpcClient("matching-service")
  private MatchingServiceGrpc.MatchingServiceBlockingStub matchingClient;

  public GrpcLocationService(DriverTelemetryRepository repo) {
    this.repo = repo;
  }

  @Override
  public StreamObserver<DriverTelemetry> streamDriverTelemetry(StreamObserver<Ack> responseObserver) {
    return new StreamObserver<>() {
      @Override
      public void onNext(DriverTelemetry telemetry) {
        Instant ts = telemetry.hasTs()
            ? Instant.ofEpochSecond(telemetry.getTs().getSeconds(), telemetry.getTs().getNanos())
            : Instant.now();
        DriverTelemetryEntity entity = repo.findByDriverId(telemetry.getDriverId())
            .map(existing -> {
              existing.update(telemetry.getRouteId(), telemetry.getCurrentAreaId(), telemetry.getOccupancy(), ts);
              return existing;
            })
            .orElseGet(() -> new DriverTelemetryEntity(
                telemetry.getDriverId(), telemetry.getRouteId(), telemetry.getCurrentAreaId(), telemetry.getOccupancy(), ts));
        repo.save(entity);
        evaluateStations(telemetry, ts);
      }

      @Override
      public void onError(Throwable t) {
        log.warn("Driver telemetry stream error", t);
      }

      @Override
      public void onCompleted() {
        responseObserver.onNext(Ack.newBuilder().setOk(true).setMsg("telemetry received").build());
        responseObserver.onCompleted();
      }
    };
  }

  @Override
  public void getDriverSnapshot(lastmile.location.DriverId request, StreamObserver<DriverSnapshot> responseObserver) {
    Optional<DriverTelemetryEntity> opt = repo.findByDriverId(request.getId());
    if (opt.isEmpty()) {
      responseObserver.onError(Status.NOT_FOUND.withDescription("driver telemetry missing").asRuntimeException());
      return;
    }
    DriverTelemetryEntity entity = opt.get();
    DriverSnapshot snapshot = DriverSnapshot.newBuilder()
        .setDriverId(entity.getDriverId())
        .setRouteId(entity.getRouteId() == null ? "" : entity.getRouteId())
        .setCurrentAreaId(entity.getAreaId())
        .setOccupancy(entity.getOccupancy())
        .setTs(toTimestamp(entity.getTs()))
        .build();
    responseObserver.onNext(snapshot);
    responseObserver.onCompleted();
  }

  @Override
  public void getDriverEta(DriverEtaRequest request, StreamObserver<DriverEta> responseObserver) {
    Optional<DriverTelemetryEntity> opt = repo.findByDriverId(request.getDriverId());
    if (opt.isEmpty()) {
      responseObserver.onNext(DriverEta.newBuilder()
          .setDriverId(request.getDriverId())
          .setStationAreaId(request.getStationAreaId())
          .setReachable(false)
          .build());
      responseObserver.onCompleted();
      return;
    }

    DriverTelemetryEntity entity = opt.get();
    RoutePlan plan = resolveRoutePlan(request.getDriverId(), entity.getRouteId());
    DriverEta.Builder etaBuilder = DriverEta.newBuilder()
        .setDriverId(request.getDriverId())
        .setStationAreaId(request.getStationAreaId())
        .setReachable(false);

    if (plan == null) {
      responseObserver.onNext(etaBuilder.build());
      responseObserver.onCompleted();
      return;
    }

    RouteStop currentStop = findStop(plan, entity.getAreaId()).orElse(null);
    RouteStop targetStop = plan.getStopsList().stream()
        .filter(s -> s.getIsStation() && s.getAreaId().equals(request.getStationAreaId()))
        .findFirst()
        .orElse(null);

    if (currentStop == null || targetStop == null || targetStop.getSequence() < currentStop.getSequence()) {
      responseObserver.onNext(etaBuilder.build());
      responseObserver.onCompleted();
      return;
    }

    int etaMinutes = targetStop.getArrivalOffsetMinutes() - currentStop.getArrivalOffsetMinutes();
    etaBuilder.setReachable(etaMinutes >= 0)
        .setEtaMinutes(Math.max(etaMinutes, 0));
    responseObserver.onNext(etaBuilder.build());
    responseObserver.onCompleted();
  }

  private void evaluateStations(DriverTelemetry telemetry, Instant ts) {
    if (telemetry.getRouteId().isBlank()) {
      return;
    }

    RoutePlan plan = resolveRoutePlan(telemetry.getDriverId(), telemetry.getRouteId());
    if (plan == null) {
      return;
    }

    Optional<RouteStop> currentStopOpt = findStop(plan, telemetry.getCurrentAreaId());
    if (currentStopOpt.isEmpty()) {
      log.debug("Driver {} in area {} not part of route {}", telemetry.getDriverId(), telemetry.getCurrentAreaId(), telemetry.getRouteId());
      return;
    }

    RouteStop currentStop = currentStopOpt.get();
    int capacity = driverCapacityCache.getOrDefault(telemetry.getDriverId(), 0);
    int seatsAvailable = Math.max(capacity - telemetry.getOccupancy(), 0);
    if (seatsAvailable <= 0) {
      return;
    }

    int currentOffset = currentStop.getArrivalOffsetMinutes();

    plan.getStopsList().stream()
        .filter(RouteStop::getIsStation)
        .filter(stop -> stop.getSequence() >= currentStop.getSequence())
        .map(stop -> new Candidate(stop, stop.getArrivalOffsetMinutes() - currentOffset))
        .filter(candidate -> candidate.etaMinutes >= 0 && candidate.etaMinutes <= 10)
        .forEach(candidate -> triggerMatching(telemetry, plan, candidate.stop, candidate.etaMinutes, ts, seatsAvailable));
  }

  private void triggerMatching(DriverTelemetry telemetry, RoutePlan plan, RouteStop stationStop, int etaMinutes, Instant ts, int seatsAvailable) {
    String key = telemetry.getDriverId() + "|" + stationStop.getAreaId();
    TriggerState previous = lastTriggerByStation.get(key);
    if (previous != null) {
      boolean etaImproved = etaMinutes < previous.etaMinutes;
      boolean expired = Duration.between(previous.at, ts).compareTo(TRIGGER_REFRESH) > 0;
      if (!etaImproved && !expired) {
        return;
      }
    }

    EvaluateDriverRequest request = EvaluateDriverRequest.newBuilder()
        .setDriverId(telemetry.getDriverId())
        .setRouteId(plan.getRouteId())
        .setStationAreaId(stationStop.getAreaId())
        .setDriverCurrentAreaId(telemetry.getCurrentAreaId())
        .setDestinationAreaId(plan.getFinalAreaId())
        .setSeatsAvailable(seatsAvailable)
        .setEtaToStationMinutes(etaMinutes)
        .setDriverLastUpdate(toTimestamp(ts))
        .build();
    try {
      matchingClient.evaluateDriver(request);
      lastTriggerByStation.put(key, new TriggerState(etaMinutes, ts));
    } catch (Exception ex) {
      log.warn("Failed to evaluate driver {} at station {}", telemetry.getDriverId(), stationStop.getAreaId(), ex);
    }
  }

  private RoutePlan resolveRoutePlan(String driverId, String routeId) {
    if (routeId == null || routeId.isBlank()) {
      return null;
    }
    CachedRoute cached = routeCache.get(routeId);
    Instant now = Instant.now();
    if (cached != null && Duration.between(cached.fetchedAt, now).compareTo(ROUTE_CACHE_TTL) < 0) {
      driverCapacityCache.putIfAbsent(driverId, cached.capacity);
      return cached.plan;
    }

    try {
      DriverProfile profile = driverClient.getDriver(DriverId.newBuilder().setId(driverId).build());
      driverCapacityCache.put(driverId, profile.getCapacity());
      profile.getRoutesList().forEach(route ->
          routeCache.put(route.getRouteId(), new CachedRoute(route, now, profile.getCapacity())));
      CachedRoute refreshed = routeCache.get(routeId);
      return refreshed != null ? refreshed.plan : null;
    } catch (Exception ex) {
      log.warn("Unable to fetch route {} for driver {}", routeId, driverId, ex);
      return null;
    }
  }

  private Optional<RouteStop> findStop(RoutePlan plan, String areaId) {
    return plan.getStopsList().stream()
        .filter(stop -> Objects.equals(stop.getAreaId(), areaId))
        .min(Comparator.comparingInt(RouteStop::getSequence));
  }

  private Timestamp toTimestamp(Instant instant) {
    return Timestamp.newBuilder()
        .setSeconds(instant.getEpochSecond())
        .setNanos(instant.getNano())
        .build();
  }

  private record CachedRoute(RoutePlan plan, Instant fetchedAt, int capacity) {}

  private record TriggerState(int etaMinutes, Instant at) {}

  private record Candidate(RouteStop stop, int etaMinutes) {}
}
