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

  @Column(name = "lat", nullable = false)
  private double lat;

  @Column(name = "lng", nullable = false)
  private double lng;

  @Column(name = "ts", nullable = false)
  private Instant ts;

  @Column(name = "speed")
  private Double speed;

  protected DriverLocationEntity() {}
  public DriverLocationEntity(String driverId, double lat, double lng, Instant ts, Double speed) {
    this.driverId = driverId; this.lat = lat; this.lng = lng; this.ts = ts; this.speed = speed;
  }
  public Long getId() { return id; }
  public String getDriverId() { return driverId; }
  public double getLat() { return lat; }
  public double getLng() { return lng; }
  public Instant getTs() { return ts; }
  public Double getSpeed() { return speed; }
}
