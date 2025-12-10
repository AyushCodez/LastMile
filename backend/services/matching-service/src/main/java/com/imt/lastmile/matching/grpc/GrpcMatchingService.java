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
  
  private static class Subscriber {
    final StreamObserver<MatchEvent> observer;
    final java.util.Set<String> stationIds;

    Subscriber(StreamObserver<MatchEvent> observer, java.util.Set<String> stationIds) {
      this.observer = observer;
      this.stationIds = stationIds;
    }
  }

  private final List<Subscriber> subscribers = new CopyOnWriteArrayList<>();

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

    System.out.println("Matched " + riders.size() + " riders. Returning potential match...");

    // Do NOT create trip automatically. Let driver accept first.
    String tripId = ""; 

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

    // Notify Driver (Optional: Frontend will handle this via response, but notification is good backup)
    // Actually, if we don't create a trip, we shouldn't send "New Trip Assigned" notification yet.
    // The frontend will show the match from the response.
    // So we can skip notification here or send a "Potential Match" notification.
    // For now, let's skip sending "New Trip Assigned" since no trip exists.
    
    // Notify Riders? No, not yet. Wait for driver to accept.

    // Broadcast event to subscribers (filtered)
    MatchEvent event = MatchEvent.newBuilder()
      .setEventId("evt-" + UUID.randomUUID().toString().substring(0, 8))
      .setStationAreaId(request.getStationAreaId())
      .setResult(result)
      .build();
    broadcastEvent(event);
  }

  @Override
  public void addRiderIntent(lastmile.matching.AddRiderIntentRequest request, StreamObserver<lastmile.matching.AddRiderIntentResponse> responseObserver) {
    java.time.Instant arrivalTime = java.time.Instant.ofEpochSecond(request.getArrivalTime().getSeconds(), request.getArrivalTime().getNanos());
    RiderIntent intent = new RiderIntent(
        request.getRiderId(),
        request.getStationAreaId(),
        request.getDestinationAreaId(),
        java.time.Instant.now(),
        arrivalTime,
        request.getPartySize()
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
    
    broadcastEvent(event);
    
    responseObserver.onNext(lastmile.matching.AddRiderIntentResponse.newBuilder().setSuccess(true).setMsg("Intent added").build());
    responseObserver.onCompleted();
  }

  @Override
  public void subscribeMatches(SubscribeRequest request, StreamObserver<MatchEvent> responseObserver) {
    System.out.println("Received subscribeMatches request from client: " + request.getClientId() + " with stations: " + request.getStationIdsList());
    subscribers.add(new Subscriber(responseObserver, new java.util.HashSet<>(request.getStationIdsList())));
    
    // Remove subscriber when client terminates (best-effort)
    responseObserver.onNext(MatchEvent.newBuilder()
      .setEventId("welcome-" + UUID.randomUUID().toString().substring(0, 6))
      .setStationAreaId("")
      .build());
  }

  private void broadcastEvent(MatchEvent event) {
    String stationId = event.getStationAreaId();
    int sentCount = 0;
    for (Subscriber sub : subscribers) {
      // Filter: Only send if the subscriber is interested in this station
      // If stationId is empty (e.g. welcome), send to all? Or maybe welcome is handled separately.
      // If subscriber has no stations (e.g. global monitor), maybe send all?
      // For now, strict filtering: must contain stationId.
      if (sub.stationIds.contains(stationId) || stationId.isEmpty()) {
        try {
          sub.observer.onNext(event);
          sentCount++;
        } catch (Exception e) {
          // Remove dead subscriber?
          subscribers.remove(sub);
        }
      }
    }
    System.out.println("Broadcasted event " + event.getEventId() + " to " + sentCount + " subscribers (Total: " + subscribers.size() + ")");
  }
  @Override
  public void cancelRideIntent(lastmile.matching.CancelRideIntentRequest request, StreamObserver<lastmile.matching.CancelRideIntentResponse> responseObserver) {
    riderStore.remove(request.getRiderId(), request.getStationAreaId());
    responseObserver.onNext(lastmile.matching.CancelRideIntentResponse.newBuilder().setSuccess(true).setMsg("Intent cancelled").build());
    responseObserver.onCompleted();
  }
}

