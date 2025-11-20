package com.imt.lastmile.matching.grpc;

import io.grpc.stub.StreamObserver;
import lastmile.matching.MatchEvent;
import lastmile.matching.MatchResponse;
import lastmile.matching.MatchingServiceGrpc;
import lastmile.matching.SubscribeRequest;
import lastmile.matching.TriggerMatchRequest;
import org.springframework.stereotype.Service;

@Service
public class GrpcMatchingService extends MatchingServiceGrpc.MatchingServiceImplBase {
  @Override
  public void triggerMatch(TriggerMatchRequest request, StreamObserver<MatchResponse> responseObserver) {
    // Placeholder: real matching would query Rider intents and Driver availability and create Trip
    responseObserver.onNext(MatchResponse.newBuilder().setMatched(false).setMsg("No-op matcher").build());
    responseObserver.onCompleted();
  }

  @Override
  public void subscribeMatches(SubscribeRequest request, StreamObserver<MatchEvent> responseObserver) {
    // Minimal implementation: immediately complete. Replace with real event stream (e.g., Reactor/Emitter) later.
    responseObserver.onCompleted();
  }
}
