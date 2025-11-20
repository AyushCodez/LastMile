package com.imt.lastmile.matching.grpc;

import io.grpc.stub.StreamObserver;
import lastmile.matching.MatchEvent;
import lastmile.matching.MatchResponse;
import lastmile.matching.MatchResult;
import lastmile.matching.MatchingServiceGrpc;
import lastmile.matching.SubscribeRequest;
import lastmile.matching.TriggerMatchRequest;
import org.springframework.stereotype.Service;
import com.imt.lastmile.matching.domain.RiderIntentStore;
import com.imt.lastmile.matching.domain.RiderIntent;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class GrpcMatchingService extends MatchingServiceGrpc.MatchingServiceImplBase {
  private final RiderIntentStore riderStore = new RiderIntentStore();
  private final List<StreamObserver<MatchEvent>> subscribers = new CopyOnWriteArrayList<>();

  @Override
  public void triggerMatch(TriggerMatchRequest request, StreamObserver<MatchResponse> responseObserver) {
    int seats = request.getSeatsAvailable();
    if (seats <= 0) {
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No seats available").build());
      responseObserver.onCompleted();
      return;
    }

    // For demo: seed some synthetic rider intents if store empty for this station.
    if (riderStore.takeMatching(request.getStationId(), request.getDriverDestination(), 1).isEmpty()) {
      // seed 3 synthetic riders
      riderStore.addSynthetic(request.getStationId(), request.getDriverDestination());
      riderStore.addSynthetic(request.getStationId(), request.getDriverDestination());
      riderStore.addSynthetic(request.getStationId(), request.getDriverDestination());
    }

    List<RiderIntent> riders = riderStore.takeMatching(request.getStationId(), request.getDriverDestination(), seats);
    if (riders.isEmpty()) {
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No riders waiting").build());
      responseObserver.onCompleted();
      return;
    }

    String tripId = "trip-" + UUID.randomUUID().toString().substring(0, 8);
    MatchResult result = MatchResult.newBuilder()
      .setTripId(tripId)
      .setDriverId(request.getDriverId())
      .addAllRiderIds(riders.stream().map(RiderIntent::getRiderId).toList())
      .build();
    MatchResponse resp = MatchResponse.newBuilder()
      .setMatched(true)
      .addResults(result)
      .setMsg("Matched " + riders.size() + " rider(s)")
      .build();
    responseObserver.onNext(resp);
    responseObserver.onCompleted();

    // Broadcast event to subscribers
    MatchEvent event = MatchEvent.newBuilder()
      .setEventId("evt-" + UUID.randomUUID().toString().substring(0, 8))
      .setStationId(request.getStationId())
      .setResult(result)
      .build();
    subscribers.forEach(sub -> {
      try { sub.onNext(event); } catch (Exception ignored) { }
    });
  }

  @Override
  public void subscribeMatches(SubscribeRequest request, StreamObserver<MatchEvent> responseObserver) {
    subscribers.add(responseObserver);
    // Remove subscriber when client terminates (best-effort)
    responseObserver.onNext(MatchEvent.newBuilder()
      .setEventId("welcome-" + UUID.randomUUID().toString().substring(0, 6))
      .setStationId("")
      .build());
  }
}

