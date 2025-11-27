package com.imt.lastmile.driver.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "driver_routes")
public class Route {
  @Id
  @Column(name = "route_id", length = 36, nullable = false, updatable = false)
  private String routeId;

  @Column(name = "final_area_id", length = 64, nullable = false)
  private String finalAreaId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id", nullable = false)
  private Driver driver;

  @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @OrderBy("sequence ASC")
  private List<RouteStopEntity> stops = new ArrayList<>();

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected Route() {}

  public Route(Driver driver) {
    this.routeId = UUID.randomUUID().toString();
    this.driver = driver;
  }

  public String getRouteId() { return routeId; }
  public String getFinalAreaId() { return finalAreaId; }
  public Driver getDriver() { return driver; }
  public Instant getCreatedAt() { return createdAt; }
  public List<RouteStopEntity> getStops() { return stops; }

  public void setDriver(Driver driver) { this.driver = driver; }

  public void replaceStops(List<RouteStopEntity> newStops) {
    this.stops.clear();
    if (newStops == null || newStops.isEmpty()) {
      throw new IllegalArgumentException("Route requires at least one stop");
    }
    newStops.sort(Comparator.comparingInt(RouteStopEntity::getSequence));
    newStops.forEach(stop -> {
      stop.setRoute(this);
      this.stops.add(stop);
    });
    this.finalAreaId = newStops.get(newStops.size() - 1).getAreaId();
  }
}
