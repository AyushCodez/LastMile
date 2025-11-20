package com.imt.lastmile.station.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stations")
public class StationEntity {
  @Id
  @Column(name = "id", length = 36, nullable = false, updatable = false)
  private String id;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "lat", nullable = false)
  private double lat;

  @Column(name = "lng", nullable = false)
  private double lng;

  @ElementCollection
  @CollectionTable(name = "station_nearby_places", joinColumns = @JoinColumn(name = "station_id"))
  @Column(name = "place_id")
  private List<String> nearbyPlaces = new ArrayList<>();

  protected StationEntity() {}
  public StationEntity(String id, String name, double lat, double lng) {
    this.id = id; this.name = name; this.lat = lat; this.lng = lng;
  }
  public String getId() { return id; }
  public String getName() { return name; }
  public double getLat() { return lat; }
  public double getLng() { return lng; }
  public List<String> getNearbyPlaces() { return nearbyPlaces; }
}
