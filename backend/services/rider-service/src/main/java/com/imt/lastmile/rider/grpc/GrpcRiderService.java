package com.imt.lastmile.rider.grpc;

import com.imt.lastmile.rider.domain.RideIntent;
import com.imt.lastmile.rider.repo.RideIntentRepository;
import io.grpc.stub.StreamObserver;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lastmile.rider.RegisterRideIntentRequest;
import lastmile.rider.RideId;
import lastmile.rider.RideIntentResponse;
import lastmile.rider.RiderServiceGrpc;
import lastmile.rider.RideStatus;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class GrpcRiderService extends RiderServiceGrpc.RiderServiceImplBase {
  @net.devh.boot.grpc.client.inject.GrpcClient("matching-service")
  private lastmile.matching.MatchingServiceGrpc.MatchingServiceBlockingStub matchingStub;

  private final RideIntentRepository repo;

  public GrpcRiderService(RideIntentRepository repo) { this.repo = repo; }

  @Override
  public void registerRideIntent(RegisterRideIntentRequest request, StreamObserver<RideIntentResponse> responseObserver) {
    Instant arr = Instant.ofEpochSecond(request.getArrivalTime().getSeconds());
    RideIntent intent = new RideIntent(request.getUserId(), request.getStationAreaId(), arr, request.getDestinationAreaId(), request.getPartySize());
    long minutesUntilArrival = ChronoUnit.MINUTES.between(Instant.now(), arr);
    if (minutesUntilArrival > 10) {
      intent.setStatus(RideIntent.Status.PENDING);
    }
    repo.save(intent);

    // Call Matching Service
    try {
        lastmile.matching.AddRiderIntentRequest matchReq = lastmile.matching.AddRiderIntentRequest.newBuilder()
            .setRiderId(request.getUserId())
            .setStationAreaId(request.getStationAreaId())
            .setDestinationAreaId(request.getDestinationAreaId())
            .setArrivalTime(request.getArrivalTime())
            .build();
        
        matchingStub.addRiderIntent(matchReq);
    } catch (Exception e) {
        // Log error but don't fail the rider request entirely? 
        // Or maybe we should fail? For now, we'll just print stack trace.
        e.printStackTrace();
    }

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
      .setDestinationAreaId(ri.getDestinationAreaId())
      .setStationAreaId(ri.getStationAreaId())
      .build());
    responseObserver.onCompleted();
  }

  @net.devh.boot.grpc.client.inject.GrpcClient("trip-service")
  private lastmile.trip.TripServiceGrpc.TripServiceBlockingStub tripClient;

  @Override
  public void getRideHistory(lastmile.rider.GetRideHistoryRequest request, StreamObserver<lastmile.rider.RideHistoryResponse> responseObserver) {
    try {
      lastmile.trip.GetTripsResponse tripsResp = tripClient.getTrips(lastmile.trip.GetTripsRequest.newBuilder()
          .setRiderId(request.getUserId())
          .build());
      
      java.util.List<RideStatus> history = tripsResp.getTripsList().stream().map(t -> RideStatus.newBuilder()
          .setTripId(t.getTripId())
          .setStatus(RideStatus.Status.valueOf(t.getStatus())) // Assuming status strings match enum names
          .setStationAreaId(t.getStationAreaId())
          .setDestinationAreaId(t.getDestinationAreaId())
          .build()).toList();
          
      responseObserver.onNext(lastmile.rider.RideHistoryResponse.newBuilder().addAllRides(history).build());
      responseObserver.onCompleted();
    } catch (Exception e) {
      responseObserver.onError(e);
    }
  }
}
