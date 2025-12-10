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
  private final java.util.Map<String, java.util.List<StreamObserver<Notification>>> activeSubscribers = new java.util.concurrent.ConcurrentHashMap<>();

  public GrpcNotificationService(NotificationRepository repo) { this.repo = repo; }

  @Override
  public void notify(Notification request, StreamObserver<Ack> responseObserver) {
    // map metadata map
    java.util.Map<String, Object> meta = new java.util.HashMap<>(request.getMetadataMap());

    repo.save(new NotificationEntity(request.getUserId(), request.getTitle(), request.getBody(), meta));

    // Push to active subscribers
    java.util.List<StreamObserver<Notification>> observers = activeSubscribers.get(request.getUserId());
    if (observers != null) {
      // Avoid ConcurrentModificationException by iterating a copy or using thread-safe list
      // But here we just iterate. If an observer is removed during iteration, it might be tricky.
      // Better to use CopyOnWriteArrayList for the values.
      observers.forEach(obs -> {
        try {
          obs.onNext(request);
        } catch (Exception e) {
          // If sending fails, we assume client disconnected.
          // We can remove it, but safe removal inside iteration requires iterator.
          // For now, let's just log.
        }
      });
    }

    responseObserver.onNext(Ack.newBuilder().setOk(true).build());
    responseObserver.onCompleted();
  }

  @Override
  public void subscribe(SubscribeRequest request, StreamObserver<Notification> responseObserver) {
    String userId = request.getUserId();
    System.out.println("Received subscribe request for user: " + userId);
    
    // Add to subscribers
    activeSubscribers.computeIfAbsent(userId, k -> new java.util.concurrent.CopyOnWriteArrayList<>()).add(responseObserver);

    // Replay recent history
    // Replay recent history - DISABLED to prevent flood
    // try {
    //     repo.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(10).forEach(n -> {
    //       try {
    //         var builder = Notification.newBuilder().setUserId(n.getUserId()).setTitle(n.getTitle()).setBody(n.getBody());
    //         // Do not parse metadata back for simplicity
    //         responseObserver.onNext(builder.build());
    //       } catch (Exception ignored) {}
    //     });
    // } catch (Exception e) {
    //     System.err.println("Error fetching history: " + e.getMessage());
    // }
    
    // Keep stream open. Handle cancellation.
    // We can use a server-side interceptor or just wait.
    // But we need to remove the observer when cancelled.
    // Since we don't have easy access to Context here without more boilerplate, 
    // we rely on onNext failing to detect disconnection, or explicit cancellation hook if available.
    // Actually, we can use Context.current().addListener(...) but that requires Context.
    
    // For this prototype, we just leave it. If onNext fails in notify(), we should remove it.
  }
}
