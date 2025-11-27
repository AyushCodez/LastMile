package com.imt.lastmile.location.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "driver_locations")
public class DriverLocationEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "driver_id", length = 36, nullable = false)
  private String driverId;

  @Column(name = "area_id", nullable = false, length = 128)
  private String areaId;

  @Column(name = "ts", nullable = false)
  private Instant ts;

  @Column(name = "speed")
  private Double speed;

  protected DriverLocationEntity() {}
  public DriverLocationEntity(String driverId, String areaId, Instant ts, Double speed) {
    this.driverId = driverId; this.areaId = areaId; this.ts = ts; this.speed = speed;
  }
  public Long getId() { return id; }
  public String getDriverId() { return driverId; }
  public String getAreaId() { return areaId; }
  public Instant getTs() { return ts; }
  public Double getSpeed() { return speed; }
}
