package com.imt.lastmile.station.grpc;

import com.imt.lastmile.station.domain.StationEntity;
import com.imt.lastmile.station.repo.StationRepository;
import io.grpc.stub.StreamObserver;
import lastmile.Station;
import lastmile.station.NearbyPlacesResponse;
import lastmile.station.StationId;
import lastmile.station.StationServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class GrpcStationService extends StationServiceGrpc.StationServiceImplBase {
  private final StationRepository repo;
  public GrpcStationService(StationRepository repo) { this.repo = repo; }

  @Override
  public void getStation(StationId request, StreamObserver<Station> responseObserver) {
    var opt = repo.findById(request.getId());
    if (opt.isEmpty()) {
      responseObserver.onNext(Station.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    StationEntity e = opt.get();
    responseObserver.onNext(Station.newBuilder()
      .setId(e.getId())
      .setName(e.getName())
      .setLocation(lastmile.GeoPoint.newBuilder().setLat(e.getLat()).setLng(e.getLng()).build())
      .addAllNearbyPlaces(e.getNearbyPlaces())
      .build());
    responseObserver.onCompleted();
  }

  @Override
  public void listNearbyPlaces(StationId request, StreamObserver<NearbyPlacesResponse> responseObserver) {
    var opt = repo.findById(request.getId());
    responseObserver.onNext(NearbyPlacesResponse.newBuilder()
      .addAllPlaceIds(opt.map(StationEntity::getNearbyPlaces).orElseGet(java.util.List::of))
      .build());
    responseObserver.onCompleted();
  }
}
