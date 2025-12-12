package com.imt.lastmile.trip.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trips")
public class Trip {
  @Id
  @Column(name = "trip_id", length = 36, nullable = false, updatable = false)
  private String tripId;

  @Column(name = "driver_id", length = 36, nullable = false)
  private String driverId;

  @Column(name = "route_id", length = 36)
  private String routeId;

  @Column(name = "station_area_id", length = 64, nullable = false)
  private String stationAreaId;

  @Column(name = "destination_area_id", length = 64, nullable = false)
  private String destinationAreaId;

  @Column(name = "status", nullable = false)
  private String status; // SCHEDULED, ACTIVE, COMPLETED

  @Column(name = "scheduled_departure", nullable = false)
  private Instant scheduledDeparture;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "trip_riders", joinColumns = @JoinColumn(name = "trip_id"))
  @Column(name = "rider_user_id")
  private List<String> riderUserIds = new ArrayList<>();

  @Column(name = "passenger_count", nullable = false)
  private int passengerCount;

  protected Trip() {}

  public Trip(String driverId, String routeId, String stationAreaId, String destinationAreaId, List<String> riderUserIds, Instant scheduledDeparture, int passengerCount) {
    this.tripId = UUID.randomUUID().toString();
    this.driverId = driverId;
    this.routeId = routeId;
    this.stationAreaId = stationAreaId;
    this.destinationAreaId = destinationAreaId;
    this.scheduledDeparture = scheduledDeparture;
    this.status = "SCHEDULED";
    if (riderUserIds != null) this.riderUserIds.addAll(riderUserIds);
    this.passengerCount = passengerCount > 0 ? passengerCount : (riderUserIds != null && !riderUserIds.isEmpty() ? riderUserIds.size() : 1);
  }

  public String getTripId() { return tripId; }
  public String getDriverId() { return driverId; }
  public String getRouteId() { return routeId; }
  public String getStationAreaId() { return stationAreaId; }
  public String getDestinationAreaId() { return destinationAreaId; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getScheduledDeparture() { return scheduledDeparture; }
  public List<String> getRiderUserIds() { return riderUserIds; }
  public int getPassengerCount() { return passengerCount; }
}
