package com.imt.lastmile.trip.grpc;

import com.imt.lastmile.trip.domain.Trip;
import com.imt.lastmile.trip.repo.TripRepository;
import com.google.protobuf.Timestamp;
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
    Instant sched = Instant.ofEpochSecond(request.getScheduledTime().getSeconds());
    Trip t = new Trip(request.getDriverId(), request.getRiderIdsList(), request.getStationId(), request.getDestination(), sched);
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
    return lastmile.trip.Trip.newBuilder()
      .setTripId(t.getTripId())
      .setDriverId(t.getDriverId())
      .addAllRiderIds(t.getRiderUserIds())
      .setStatus(t.getStatus())
      .setScheduledTime(Timestamp.newBuilder().setSeconds(t.getScheduledTime().getEpochSecond()).build())
      .build();
  }
}
