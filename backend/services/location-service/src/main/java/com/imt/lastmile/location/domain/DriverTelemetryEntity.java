package com.imt.lastmile.location.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "driver_telemetry")
public class DriverTelemetryEntity {
  @Id
  @Column(name = "driver_id", length = 36, nullable = false)
  private String driverId;

  @Column(name = "route_id", length = 36)
  private String routeId;

  @Column(name = "area_id", length = 64, nullable = false)
  private String areaId;

  @Column(name = "occupancy", nullable = false)
  private int occupancy;

  @Column(name = "ts", nullable = false)
  private Instant ts;

  protected DriverTelemetryEntity() {}

  public DriverTelemetryEntity(String driverId, String routeId, String areaId, int occupancy, Instant ts) {
    this.driverId = driverId;
    this.routeId = routeId;
    this.areaId = areaId;
    this.occupancy = occupancy;
    this.ts = ts;
  }

  public String getDriverId() { return driverId; }
  public String getRouteId() { return routeId; }
  public String getAreaId() { return areaId; }
  public int getOccupancy() { return occupancy; }
  public Instant getTs() { return ts; }

  public void update(String routeId, String areaId, int occupancy, Instant ts) {
    this.routeId = routeId;
    this.areaId = areaId;
    this.occupancy = occupancy;
    this.ts = ts;
  }
}
