package com.imt.lastmile.driver.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "routes")
public class Route {
  @Id
  @Column(name = "route_id", length = 36, nullable = false, updatable = false)
  private String routeId;

  @Column(name = "destination", nullable = false)
  private String destination;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id", nullable = false)
  private Driver driver;

  // Persist station ids in a separate join table
  @ElementCollection
  @CollectionTable(name = "route_stations", joinColumns = @JoinColumn(name = "route_id"))
  @Column(name = "station_id")
  private List<String> stationIds = new ArrayList<>();

  protected Route() {}

  public Route(String destination, List<String> stationIds) {
    this.routeId = UUID.randomUUID().toString();
    this.destination = destination;
    if (stationIds != null) this.stationIds.addAll(stationIds);
  }

  public String getRouteId() { return routeId; }
  public String getDestination() { return destination; }
  public List<String> getStationIds() { return stationIds; }
  public Driver getDriver() { return driver; }
  public void setDriver(Driver driver) { this.driver = driver; }
}
