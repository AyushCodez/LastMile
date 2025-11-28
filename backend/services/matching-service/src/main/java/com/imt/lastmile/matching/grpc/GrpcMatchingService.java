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
  private final RiderIntentStore riderStore = new RiderIntentStore();
  private final List<StreamObserver<MatchEvent>> subscribers = new CopyOnWriteArrayList<>();

  @Override
  public void evaluateDriver(EvaluateDriverRequest request, StreamObserver<MatchResponse> responseObserver) {
    int seats = request.getSeatsAvailable();
    if (seats <= 0) {
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No seats available").build());
      responseObserver.onCompleted();
      return;
    }

    // TODO: incorporate eta_to_station_minutes and driver_current_area_id when prioritising intents.

    List<RiderIntent> riders = riderStore.takeMatching(request.getStationAreaId(), request.getDestinationAreaId(), seats);
    if (riders.isEmpty()) {
      // For demo: seed some synthetic rider intents if store empty for this station/destination pair.
      riderStore.addSynthetic(request.getStationAreaId(), request.getDestinationAreaId());
      riderStore.addSynthetic(request.getStationAreaId(), request.getDestinationAreaId());
      riderStore.addSynthetic(request.getStationAreaId(), request.getDestinationAreaId());
      riders = riderStore.takeMatching(request.getStationAreaId(), request.getDestinationAreaId(), seats);
    }
    if (riders.isEmpty()) {
      responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No riders waiting").build());
      responseObserver.onCompleted();
      return;
    }

    String tripId = "trip-" + UUID.randomUUID().toString().substring(0, 8);
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
  public void subscribeMatches(SubscribeRequest request, StreamObserver<MatchEvent> responseObserver) {
    subscribers.add(responseObserver);
    // Remove subscriber when client terminates (best-effort)
    responseObserver.onNext(MatchEvent.newBuilder()
      .setEventId("welcome-" + UUID.randomUUID().toString().substring(0, 6))
      .setStationAreaId("")
      .build());
  }
}

