package com.imt.lastmile.matching.grpc;

import com.imt.lastmile.matching.domain.RiderIntent;
import com.imt.lastmile.matching.domain.RiderIntentStore;
import io.grpc.stub.StreamObserver;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import lastmile.matching.EvaluateDriverRequest;
import lastmile.matching.MatchEvent;
import lastmile.matching.MatchResponse;
import lastmile.matching.MatchResult;
import lastmile.matching.MatchingServiceGrpc;
import lastmile.matching.SubscribeRequest;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class GrpcMatchingService extends MatchingServiceGrpc.MatchingServiceImplBase {
  @org.springframework.beans.factory.annotation.Autowired
  private RiderIntentStore riderStore;
  
  private final List<StreamObserver<MatchEvent>> subscribers = new CopyOnWriteArrayList<>();

  @net.devh.boot.grpc.client.inject.GrpcClient("trip-service")
  private lastmile.trip.TripServiceGrpc.TripServiceBlockingStub tripClient;

  @net.devh.boot.grpc.client.inject.GrpcClient("notification-service")
  private lastmile.notification.NotificationServiceGrpc.NotificationServiceBlockingStub notificationClient;

  public GrpcMatchingService() {
  }

  @Override
  public void evaluateDriver(EvaluateDriverRequest request, StreamObserver<MatchResponse> responseObserver) {
    int seats = request.getSeatsAvailable();
    if (seats <= 0) {
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No seats available").build());
      responseObserver.onCompleted();
      return;
    }

    // Pass driver ETA to matching logic
    System.out.println("Evaluating driver " + request.getDriverId() + ". Seats: " + seats + ", ETA: " + request.getEtaToStationMinutes());
    List<RiderIntent> riders = riderStore.takeMatching(request.getStationAreaId(), request.getDestinationAreaId(), seats, request.getEtaToStationMinutes());
    
    if (riders.isEmpty()) {
      System.out.println("No riders matched for driver " + request.getDriverId());
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No riders waiting").build());
      responseObserver.onCompleted();
      return;
    }

    System.out.println("Matched " + riders.size() + " riders. Creating trip...");

    // Call Trip Service to create trip
    String tripId = "trip-" + UUID.randomUUID().toString().substring(0, 8);
    try {
      lastmile.trip.CreateTripRequest tripReq = lastmile.trip.CreateTripRequest.newBuilder()
          .setDriverId(request.getDriverId())
          .setRouteId(request.getRouteId())
          .setStationAreaId(request.getStationAreaId())
          .setDestinationAreaId(request.getDestinationAreaId())
          .addAllRiderIds(riders.stream().map(RiderIntent::getRiderId).toList())
          .setScheduledDeparture(request.getDriverLastUpdate()) // Approximate
          .build();
      System.out.println("Sending CreateTripRequest to TripService...");
      lastmile.trip.Trip trip = tripClient.createTrip(tripReq);
      tripId = trip.getTripId();
      System.out.println("Trip created successfully. TripID: " + tripId);
    } catch (Exception e) {
      System.err.println("Failed to create trip in TripService: " + e.getMessage());
      e.printStackTrace();
    }

    MatchResult result = MatchResult.newBuilder()
      .setTripId(tripId)
      .setDriverId(request.getDriverId())
      .setStationAreaId(request.getStationAreaId())
      .setDestinationAreaId(request.getDestinationAreaId())
      .addAllRiderIds(riders.stream().map(RiderIntent::getRiderId).toList())
      .build();
    MatchResponse resp = MatchResponse.newBuilder()
      .setMatched(true)
      .addResults(result)
      .setMsg("Matched " + riders.size() + " rider(s)")
      .build();
    responseObserver.onNext(resp);
    responseObserver.onCompleted();

    // Notify Driver
    try {
      System.out.println("Notifying driver " + request.getDriverId());
      notificationClient.notify(lastmile.notification.Notification.newBuilder()
          .setUserId(request.getDriverId()) // Assuming driverId maps to userId for notification
          .setTitle("New Trip Assigned")
          .setBody("You have been matched with " + riders.size() + " riders. Trip ID: " + tripId)
          .putMetadata("tripId", tripId)
          .build());
    } catch (Exception e) {
      System.err.println("Failed to notify driver: " + e.getMessage());
    }

    // Notify Riders
    for (RiderIntent rider : riders) {
      try {
        System.out.println("Notifying rider " + rider.getRiderId());
        notificationClient.notify(lastmile.notification.Notification.newBuilder()
            .setUserId(rider.getRiderId())
            .setTitle("Ride Matched")
            .setBody("Your ride has been matched! Driver is on the way.")
            .putMetadata("tripId", tripId)
            .putMetadata("driverId", request.getDriverId())
            .build());
      } catch (Exception e) {
        System.err.println("Failed to notify rider: " + e.getMessage());
      }
    }

    // Broadcast event to subscribers
    MatchEvent event = MatchEvent.newBuilder()
      .setEventId("evt-" + UUID.randomUUID().toString().substring(0, 8))
      .setStationAreaId(request.getStationAreaId())
      .setResult(result)
      .build();
    subscribers.forEach(sub -> {
      try { sub.onNext(event); } catch (Exception ignored) { }
    });
  }

  @Override
  public void addRiderIntent(lastmile.matching.AddRiderIntentRequest request, StreamObserver<lastmile.matching.AddRiderIntentResponse> responseObserver) {
    java.time.Instant arrivalTime = java.time.Instant.ofEpochSecond(request.getArrivalTime().getSeconds(), request.getArrivalTime().getNanos());
    RiderIntent intent = new RiderIntent(
        request.getRiderId(),
        request.getStationAreaId(),
        request.getDestinationAreaId(),
        java.time.Instant.now(),
        arrivalTime
    );
    riderStore.add(intent);
    
    // Notify subscribers (e.g., drivers) that a new rider has arrived
    MatchEvent event = MatchEvent.newBuilder()
      .setEventId("new-rider-" + UUID.randomUUID().toString().substring(0, 8))
      .setStationAreaId(request.getStationAreaId())
      .setResult(MatchResult.newBuilder()
          .setStationAreaId(request.getStationAreaId())
          .setDestinationAreaId(request.getDestinationAreaId())
          .build()) // Include params for filtering
      .build();
    subscribers.forEach(sub -> {
      try { sub.onNext(event); } catch (Exception ignored) { }
    });
    System.out.println("Broadcasted new-rider event to " + subscribers.size() + " subscribers for station: " + request.getStationAreaId());

    responseObserver.onNext(lastmile.matching.AddRiderIntentResponse.newBuilder().setSuccess(true).setMsg("Intent added").build());
    responseObserver.onCompleted();
  }

  @Override
  public void subscribeMatches(SubscribeRequest request, StreamObserver<MatchEvent> responseObserver) {
    System.out.println("Received subscribeMatches request from client: " + request.getClientId());
    subscribers.add(responseObserver);
    // Remove subscriber when client terminates (best-effort)
    responseObserver.onNext(MatchEvent.newBuilder()
      .setEventId("welcome-" + UUID.randomUUID().toString().substring(0, 6))
      .setStationAreaId("")
      .build());
  }
}

