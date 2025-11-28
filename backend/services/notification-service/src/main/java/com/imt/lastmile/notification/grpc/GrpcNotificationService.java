package com.imt.lastmile.notification.grpc;

import com.imt.lastmile.notification.domain.NotificationEntity;
import com.imt.lastmile.notification.repo.NotificationRepository;
import io.grpc.stub.StreamObserver;
import lastmile.notification.Ack;
import lastmile.notification.Notification;
import lastmile.notification.NotificationServiceGrpc;
import lastmile.notification.SubscribeRequest;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class GrpcNotificationService extends NotificationServiceGrpc.NotificationServiceImplBase {
  private final NotificationRepository repo;
  public GrpcNotificationService(NotificationRepository repo) { this.repo = repo; }

  @Override
  public void notify(Notification request, StreamObserver<Ack> responseObserver) {
    // map metadata map to JSON string
    String json = new com.fasterxml.jackson.databind.ObjectMapper()
      .valueToTree(request.getMetadataMap()).toString();
    repo.save(new NotificationEntity(request.getUserId(), request.getTitle(), request.getBody(), json));
    responseObserver.onNext(Ack.newBuilder().setOk(true).build());
    responseObserver.onCompleted();
  }

  @Override
  public void subscribe(SubscribeRequest request, StreamObserver<Notification> responseObserver) {
    // Minimal implementation: replay recent notifications and complete.
    repo.findByUserIdOrderByCreatedAtDesc(request.getUserId()).stream().limit(10).forEach(n -> {
      try {
        var builder = Notification.newBuilder().setUserId(n.getUserId()).setTitle(n.getTitle()).setBody(n.getBody());
        // Do not parse metadata back for simplicity
        responseObserver.onNext(builder.build());
      } catch (Exception ignored) {}
    });
    responseObserver.onCompleted();
  }
}
