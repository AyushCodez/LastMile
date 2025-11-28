package com.imt.lastmile.station.grpc;

import com.imt.lastmile.station.domain.AreaEdgeEntity;
import com.imt.lastmile.station.domain.AreaEntity;
import com.imt.lastmile.station.repo.AreaRepository;
import io.grpc.stub.StreamObserver;
import java.util.List;
import java.util.stream.Collectors;
import lastmile.AreaEdge;
import lastmile.station.AreaId;
import lastmile.station.AreaList;
import lastmile.station.ListAreasRequest;
import lastmile.station.ListStationsRequest;
import lastmile.station.StationServiceGrpc;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class GrpcStationService extends StationServiceGrpc.StationServiceImplBase {
  private final AreaRepository repo;

  public GrpcStationService(AreaRepository repo) {
    this.repo = repo;
  }

  @Override
  public void getArea(AreaId request, StreamObserver<lastmile.Area> responseObserver) {
    repo.findByAreaId(request.getId())
        .map(this::toProto)
        .ifPresentOrElse(response -> {
          responseObserver.onNext(response);
          responseObserver.onCompleted();
        }, () -> {
          responseObserver.onNext(lastmile.Area.newBuilder().build());
          responseObserver.onCompleted();
        });
  }

  @Override
  public void listAreas(ListAreasRequest request, StreamObserver<AreaList> responseObserver) {
    List<lastmile.Area> areas = repo.findAll().stream().map(this::toProto).collect(Collectors.toList());
    responseObserver.onNext(AreaList.newBuilder().addAllItems(areas).build());
    responseObserver.onCompleted();
  }

  @Override
  public void listStations(ListStationsRequest request, StreamObserver<AreaList> responseObserver) {
    List<lastmile.Area> stations = repo.findAll().stream()
        .filter(AreaEntity::isStation)
        .map(this::toProto)
        .collect(Collectors.toList());
    responseObserver.onNext(AreaList.newBuilder().addAllItems(stations).build());
    responseObserver.onCompleted();
  }

  private lastmile.Area toProto(AreaEntity area) {
    lastmile.Area.Builder builder = lastmile.Area.newBuilder()
        .setId(area.getAreaId())
        .setName(area.getName())
        .setIsStation(area.isStation());
    area.getNeighbours().forEach(edge -> builder.addNeighbours(toEdge(edge)));
    return builder.build();
  }

  private AreaEdge toEdge(AreaEdgeEntity edge) {
    return AreaEdge.newBuilder()
        .setToAreaId(edge.getKey().getToAreaId())
        .setTravelMinutes(edge.getTravelMinutes())
        .build();
  }
}
