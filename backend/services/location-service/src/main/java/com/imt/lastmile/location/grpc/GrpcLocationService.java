package com.imt.lastmile.location.grpc;

import com.imt.lastmile.location.domain.DriverLocationEntity;
import com.imt.lastmile.location.repo.DriverLocationRepository;
import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import java.time.Instant;
import lastmile.location.Ack;
import lastmile.location.DriverId;
import lastmile.location.DriverLocation;
import lastmile.location.LocationServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class GrpcLocationService extends LocationServiceGrpc.LocationServiceImplBase {
  private final DriverLocationRepository repo;
  public GrpcLocationService(DriverLocationRepository repo) { this.repo = repo; }

  @Override
  public StreamObserver<DriverLocation> streamDriverLocation(StreamObserver<Ack> responseObserver) {
    return new StreamObserver<>() {
      @Override public void onNext(DriverLocation dl) {
        Instant ts = dl.hasTs() ? Instant.ofEpochSecond(dl.getTs().getSeconds()) : Instant.now();
        repo.save(new DriverLocationEntity(dl.getDriverId(), dl.getPt().getLat(), dl.getPt().getLng(), ts, dl.getSpeed()));
      }
      @Override public void onError(Throwable t) { }
      @Override public void onCompleted() {
        responseObserver.onNext(Ack.newBuilder().setOk(true).setMsg("received").build());
        responseObserver.onCompleted();
      }
    };
  }

  @Override
  public void getDriverLocation(DriverId request, StreamObserver<DriverLocation> responseObserver) {
    var opt = repo.findFirstByDriverIdOrderByTsDesc(request.getId());
    if (opt.isEmpty()) {
      responseObserver.onNext(DriverLocation.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    var e = opt.get();
    responseObserver.onNext(DriverLocation.newBuilder()
      .setDriverId(e.getDriverId())
      .setPt(lastmile.GeoPoint.newBuilder().setLat(e.getLat()).setLng(e.getLng()).build())
      .setTs(Timestamp.newBuilder().setSeconds(e.getTs().getEpochSecond()).build())
      .setSpeed(e.getSpeed() == null ? 0.0 : e.getSpeed())
      .build());
    responseObserver.onCompleted();
  }
}
