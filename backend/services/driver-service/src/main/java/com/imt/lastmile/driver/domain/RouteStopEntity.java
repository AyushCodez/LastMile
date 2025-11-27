package com.imt.lastmile.driver.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "route_stops", indexes = {
  @Index(name = "idx_route_stops_route_seq", columnList = "route_id, sequence_no", unique = true)
})
public class RouteStopEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "route_id", nullable = false)
  private Route route;

  @Column(name = "sequence_no", nullable = false)
  private int sequence;

  @Column(name = "area_id", length = 64, nullable = false)
  private String areaId;

  @Column(name = "is_station", nullable = false)
  private boolean station;

  @Column(name = "arrival_offset_minutes", nullable = false)
  private int arrivalOffsetMinutes;

  protected RouteStopEntity() {}

  public RouteStopEntity(int sequence, String areaId, boolean station, int arrivalOffsetMinutes) {
    this.sequence = sequence;
    this.areaId = areaId;
    this.station = station;
    this.arrivalOffsetMinutes = arrivalOffsetMinutes;
  }

  public Long getId() { return id; }
  public Route getRoute() { return route; }
  public void setRoute(Route route) { this.route = route; }
  public int getSequence() { return sequence; }
  public String getAreaId() { return areaId; }
  public boolean isStation() { return station; }
  public int getArrivalOffsetMinutes() { return arrivalOffsetMinutes; }

  public void update(int sequence, String areaId, boolean station, int arrivalOffsetMinutes) {
    this.sequence = sequence;
    this.areaId = areaId;
    this.station = station;
    this.arrivalOffsetMinutes = arrivalOffsetMinutes;
  }
}
