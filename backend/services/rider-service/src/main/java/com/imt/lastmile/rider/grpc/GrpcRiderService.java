package com.imt.lastmile.rider.grpc;

import com.imt.lastmile.rider.domain.RideIntent;
import com.imt.lastmile.rider.repo.RideIntentRepository;
import io.grpc.stub.StreamObserver;
import java.time.Instant;
import lastmile.rider.RegisterRideIntentRequest;
import lastmile.rider.RideId;
import lastmile.rider.RideIntentResponse;
import lastmile.rider.RiderServiceGrpc;
import lastmile.rider.RideStatus;
import org.springframework.stereotype.Service;

@Service
public class GrpcRiderService extends RiderServiceGrpc.RiderServiceImplBase {
  private final RideIntentRepository repo;

  public GrpcRiderService(RideIntentRepository repo) { this.repo = repo; }

  @Override
  public void registerRideIntent(RegisterRideIntentRequest request, StreamObserver<RideIntentResponse> responseObserver) {
    Instant arr = Instant.ofEpochSecond(request.getArrivalTime().getSeconds());
    RideIntent intent = new RideIntent(request.getUserId(), request.getStationId(), arr, request.getDestination(), request.getPartySize());
    repo.save(intent);
    responseObserver.onNext(RideIntentResponse.newBuilder().setIntentId(intent.getIntentId()).build());
    responseObserver.onCompleted();
  }

  @Override
  public void getRideStatus(RideId request, StreamObserver<RideStatus> responseObserver) {
    var opt = repo.findById(request.getId());
    if (opt.isEmpty()) {
      responseObserver.onNext(RideStatus.newBuilder().setStatus(RideStatus.Status.CANCELLED).build());
      responseObserver.onCompleted();
      return;
    }
    RideIntent ri = opt.get();
    responseObserver.onNext(RideStatus.newBuilder()
      .setIntentId(ri.getIntentId())
      .setStatus(RideStatus.Status.valueOf(ri.getStatus().name()))
      .setTripId(ri.getTripId() == null ? "" : ri.getTripId())
      .build());
    responseObserver.onCompleted();
  }
}
