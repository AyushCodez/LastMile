package com.imt.lastmile.trip.grpc;

import com.google.protobuf.TimestampProto;
import com.google.protobuf.TimestampProto.Timestamp;
import com.imt.lastmile.trip.domain.Trip;
import com.imt.lastmile.trip.repo.TripRepository;
import io.grpc.stub.StreamObserver;
import java.time.Instant;
import lastmile.trip.CreateTripRequest;
import lastmile.trip.TripId;
import lastmile.trip.TripServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class GrpcTripService extends TripServiceGrpc.TripServiceImplBase {
  private final TripRepository repo;
  public GrpcTripService(TripRepository repo) { this.repo = repo; }

  @Override
  public void createTrip(CreateTripRequest request, StreamObserver<lastmile.trip.Trip> responseObserver) {
    Instant sched = request.hasScheduledDeparture()
        ? Instant.ofEpochSecond(request.getScheduledDeparture().getSeconds(), request.getScheduledDeparture().getNanos())
        : Instant.now();
    Trip t = new Trip(
        request.getDriverId(),
        request.getRouteId(),
        request.getStationAreaId(),
        request.getDestinationAreaId(),
        request.getRiderIdsList(),
        sched);
    repo.save(t);
    responseObserver.onNext(toProto(t));
    responseObserver.onCompleted();
  }

  @Override
  public void updateTripStatus(lastmile.trip.UpdateTripRequest request, StreamObserver<lastmile.trip.Trip> responseObserver) {
    var opt = repo.findById(request.getTripId());
    if (opt.isEmpty()) {
      responseObserver.onNext(lastmile.trip.Trip.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    Trip t = opt.get();
    t.setStatus(request.getStatus());
    repo.save(t);
    responseObserver.onNext(toProto(t));
    responseObserver.onCompleted();
  }

  @Override
  public void getTrip(TripId request, StreamObserver<lastmile.trip.Trip> responseObserver) {
    var opt = repo.findById(request.getId());
    responseObserver.onNext(opt.map(this::toProto).orElse(lastmile.trip.Trip.newBuilder().build()));
    responseObserver.onCompleted();
  }

  private lastmile.trip.Trip toProto(Trip t) {
    Timestamp departure = toTimestamp(t.getScheduledDeparture());
    lastmile.trip.Trip.Builder builder = lastmile.trip.Trip.newBuilder()
        .setTripId(t.getTripId())
        .setDriverId(t.getDriverId())
        .setRouteId(t.getRouteId() == null ? "" : t.getRouteId())
        .setStationAreaId(t.getStationAreaId())
        .setDestinationAreaId(t.getDestinationAreaId())
        .setStatus(t.getStatus())
        .setScheduledDeparture(departure)
        .addAllRiderIds(t.getRiderUserIds());
    return builder.build();
  }

  private Timestamp toTimestamp(Instant instant) {
    return Timestamp.newBuilder()
        .setSeconds(instant.getEpochSecond())
        .setNanos(instant.getNano())
        .build();
  }
}
