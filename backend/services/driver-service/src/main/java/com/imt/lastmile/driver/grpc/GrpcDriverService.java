package com.imt.lastmile.driver.grpc;

import com.google.protobuf.TimestampProto.Timestamp;
import com.imt.lastmile.driver.domain.Driver;
import com.imt.lastmile.driver.domain.Route;
import com.imt.lastmile.driver.domain.RouteStopEntity;
import com.imt.lastmile.driver.repo.AreaEdgeRepository;
import com.imt.lastmile.driver.repo.AreaRepository;
import com.imt.lastmile.driver.repo.DriverRepository;
import com.imt.lastmile.driver.repo.RouteRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lastmile.driver.Ack;
import lastmile.driver.DriverId;
import lastmile.driver.DriverProfile;
import lastmile.driver.DriverServiceGrpc;
import lastmile.driver.RegisterDriverRequest;
import lastmile.driver.RegisterRouteRequest;
import lastmile.driver.RoutePlan;
import lastmile.driver.RouteStop;
import lastmile.driver.UpdateRouteRequest;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

@GrpcService
public class GrpcDriverService extends DriverServiceGrpc.DriverServiceImplBase {
  private final DriverRepository driverRepo;
  private final RouteRepository routeRepo;
  private final AreaRepository areaRepo;
  private final AreaEdgeRepository edgeRepo;

  public GrpcDriverService(
      DriverRepository driverRepo,
      RouteRepository routeRepo,
      AreaRepository areaRepo,
      AreaEdgeRepository edgeRepo) {
    this.driverRepo = driverRepo;
    this.routeRepo = routeRepo;
    this.areaRepo = areaRepo;
    this.edgeRepo = edgeRepo;
  }

  @Override
  @Transactional
  public void registerDriver(RegisterDriverRequest request, StreamObserver<DriverProfile> responseObserver) {
    Driver d = new Driver(request.getUserId(), request.getVehicleNo(), request.getCapacity());
    d = driverRepo.save(d);
    responseObserver.onNext(toProfile(d));
    responseObserver.onCompleted();
  }

  @Override
  @Transactional
  public void registerRoute(RegisterRouteRequest request, StreamObserver<RoutePlan> responseObserver) {
    Optional<Driver> driverOpt = driverRepo.findById(request.getDriverId());
    if (driverOpt.isEmpty()) {
      responseObserver.onError(Status.NOT_FOUND.withDescription("Driver not found").asRuntimeException());
      return;
    }

    try {
      Route route = new Route(driverOpt.get());
      List<RouteStopEntity> stops = buildStops(request.getStopsList());
      route.replaceStops(stops);
      route = routeRepo.save(route);
      responseObserver.onNext(toRoutePlan(route));
      responseObserver.onCompleted();
    } catch (IllegalArgumentException ex) {
      responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
    }
  }

  @Override
  @Transactional
  public void updateRoute(UpdateRouteRequest request, StreamObserver<RoutePlan> responseObserver) {
    Optional<Driver> driverOpt = driverRepo.findById(request.getDriverId());
    if (driverOpt.isEmpty()) {
      responseObserver.onError(Status.NOT_FOUND.withDescription("Driver not found").asRuntimeException());
      return;
    }

    Optional<Route> routeOpt = routeRepo.findByRouteIdAndDriver_DriverId(request.getRouteId(), request.getDriverId());
    if (routeOpt.isEmpty()) {
      responseObserver.onError(Status.NOT_FOUND.withDescription("Route not found").asRuntimeException());
      return;
    }

    try {
      Route route = routeOpt.get();
      List<RouteStopEntity> stops = buildStops(request.getStopsList());
      route.replaceStops(stops);
      route = routeRepo.save(route);
      responseObserver.onNext(toRoutePlan(route));
      responseObserver.onCompleted();
    } catch (IllegalArgumentException ex) {
      responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
    }
  }

  @Override
  public void updatePickupStatus(lastmile.driver.UpdatePickupRequest request, StreamObserver<Ack> responseObserver) {
    responseObserver.onNext(Ack.newBuilder().setOk(true).setMsg("Noted").build());
    responseObserver.onCompleted();
  }

  @Override
  public void getDriver(DriverId request, StreamObserver<DriverProfile> responseObserver) {
    Optional<Driver> driverOpt = driverRepo.findById(request.getId());
    if (driverOpt.isEmpty()) {
      responseObserver.onNext(DriverProfile.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    responseObserver.onNext(toProfile(driverOpt.get()));
    responseObserver.onCompleted();
  }

  private DriverProfile toProfile(Driver driver) {
    List<RoutePlan> plans = routeRepo
        .findByDriver_DriverId(driver.getDriverId())
        .stream()
        .sorted(Comparator.comparing(Route::getCreatedAt))
        .map(this::toRoutePlan)
        .collect(Collectors.toList());

    return DriverProfile.newBuilder()
        .setDriverId(driver.getDriverId())
        .setUserId(driver.getUserId())
        .setVehicleNo(driver.getVehicleNo())
        .setCapacity(driver.getCapacity())
        .addAllRoutes(plans)
        .build();
  }

  private RoutePlan toRoutePlan(Route route) {
    RoutePlan.Builder builder = RoutePlan.newBuilder()
        .setRouteId(route.getRouteId())
        .setDriverId(route.getDriver().getDriverId())
        .setFinalAreaId(route.getFinalAreaId())
        .setCreatedAt(toTimestamp(route.getCreatedAt()));

    route.getStops().stream()
        .sorted(Comparator.comparingInt(RouteStopEntity::getSequence))
        .forEach(stop -> builder.addStops(RouteStop.newBuilder()
            .setSequence(stop.getSequence())
            .setAreaId(stop.getAreaId())
            .setIsStation(stop.isStation())
            .setArrivalOffsetMinutes(stop.getArrivalOffsetMinutes())
            .build()));
    return builder.build();
  }

  private List<RouteStopEntity> buildStops(List<RouteStop> protoStops) {
    if (protoStops.isEmpty()) {
      throw new IllegalArgumentException("Route must contain at least one stop");
    }
    List<RouteStopEntity> stops = new ArrayList<>();
    boolean containsStation = false;
    int prevOffset = -1;

    for (int i = 0; i < protoStops.size(); i++) {
      RouteStop stop = protoStops.get(i);
      String areaId = stop.getAreaId();
      if (areaId == null || areaId.isBlank()) {
        throw new IllegalArgumentException("Stop area_id cannot be blank");
      }
      if (!areaRepo.existsById(areaId)) {
        throw new IllegalArgumentException("Unknown area_id: " + areaId);
      }
      int offset = stop.getArrivalOffsetMinutes();
      if (offset < 0) {
        throw new IllegalArgumentException("arrival_offset_minutes must be non-negative");
      }
      if (offset < prevOffset) {
        throw new IllegalArgumentException("arrival_offset_minutes must be non-decreasing");
      }
      prevOffset = offset;

      boolean isStation = stop.getIsStation();
      if (isStation) {
        containsStation = true;
      }

      stops.add(new RouteStopEntity(i, areaId, isStation, offset));
    }

    if (!containsStation) {
      throw new IllegalArgumentException("Route requires at least one station stop");
    }

    for (int i = 0; i < stops.size() - 1; i++) {
      RouteStopEntity current = stops.get(i);
      RouteStopEntity next = stops.get(i + 1);
      if (!edgeRepo.hasEdge(current.getAreaId(), next.getAreaId())) {
        throw new IllegalArgumentException("Areas " + current.getAreaId() + " and " + next.getAreaId() + " are not connected");
      }
    }

    return stops;
  }

  private Timestamp toTimestamp(Instant instant) {
    return Timestamp.newBuilder()
        .setSeconds(instant.getEpochSecond())
        .setNanos(instant.getNano())
        .build();
  }
}
