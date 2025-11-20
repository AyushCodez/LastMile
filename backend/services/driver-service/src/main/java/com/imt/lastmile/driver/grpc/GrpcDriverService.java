package com.imt.lastmile.driver.grpc;

import com.imt.lastmile.driver.domain.Driver;
import com.imt.lastmile.driver.domain.Route;
import com.imt.lastmile.driver.repo.DriverRepository;
import com.imt.lastmile.driver.repo.RouteRepository;
import io.grpc.stub.StreamObserver;
import java.util.stream.Collectors;
import lastmile.driver.Ack;
import lastmile.driver.DriverId;
import lastmile.driver.DriverInfo;
import lastmile.driver.DriverServiceGrpc;
import lastmile.driver.RegisterDriverRequest;
import lastmile.driver.RegisterRouteRequest;
import org.springframework.stereotype.Service;

@Service
public class GrpcDriverService extends DriverServiceGrpc.DriverServiceImplBase {
  private final DriverRepository driverRepo;
  private final RouteRepository routeRepo;

  public GrpcDriverService(DriverRepository driverRepo, RouteRepository routeRepo) {
    this.driverRepo = driverRepo;
    this.routeRepo = routeRepo;
  }

  @Override
  public void registerDriver(RegisterDriverRequest request, StreamObserver<DriverInfo> responseObserver) {
    Driver d = new Driver(request.getUserId(), request.getVehicleNo(), request.getCapacity());
    d = driverRepo.save(d);
    responseObserver.onNext(toInfo(d));
    responseObserver.onCompleted();
  }

  @Override
  public void registerRoute(RegisterRouteRequest request, StreamObserver<lastmile.driver.Route> responseObserver) {
    var driver = driverRepo.findById(request.getDriverId());
    if (driver.isEmpty()) {
      responseObserver.onNext(lastmile.driver.Route.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    var pr = request.getRoute();
    Route r = new Route(pr.getDestination(), pr.getStationIdsList());
    r.setDriver(driver.get());
    r = routeRepo.save(r);
    responseObserver.onNext(toProto(r));
    responseObserver.onCompleted();
  }

  @Override
  public void updatePickupStatus(lastmile.driver.UpdatePickupRequest request, StreamObserver<Ack> responseObserver) {
    // Persisting pickup status timeline is out of scope; acknowledge.
    responseObserver.onNext(Ack.newBuilder().setOk(true).setMsg("Noted").build());
    responseObserver.onCompleted();
  }

  @Override
  public void getDriver(DriverId request, StreamObserver<DriverInfo> responseObserver) {
    var d = driverRepo.findById(request.getId());
    if (d.isEmpty()) {
      responseObserver.onNext(DriverInfo.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    responseObserver.onNext(toInfo(d.get()));
    responseObserver.onCompleted();
  }

  private DriverInfo toInfo(Driver d) {
    var routes = routeRepo.findByDriver_DriverId(d.getDriverId()).stream().map(this::toProto).collect(Collectors.toList());
    return DriverInfo.newBuilder()
      .setDriverId(d.getDriverId())
      .setUserId(d.getUserId())
      .setVehicleNo(d.getVehicleNo())
      .setCapacity(d.getCapacity())
      .addAllRoutes(routes)
      .build();
  }

  private lastmile.driver.Route toProto(Route r) {
    return lastmile.driver.Route.newBuilder()
      .setRouteId(r.getRouteId())
      .setDestination(r.getDestination())
      .addAllStationIds(r.getStationIds())
      .build();
  }
}
