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

  @Column(name = "status", nullable = false)
  private String status; // SCHEDULED, ACTIVE, COMPLETED

  @Column(name = "scheduled_time", nullable = false)
  private Instant scheduledTime;

  @Column(name = "destination", nullable = false)
  private String destination;

  @ElementCollection
  @CollectionTable(name = "trip_riders", joinColumns = @JoinColumn(name = "trip_id"))
  @Column(name = "rider_user_id")
  private List<String> riderUserIds = new ArrayList<>();

  protected Trip() {}

  public Trip(String driverId, List<String> riderUserIds, String stationId, String destination, Instant scheduledTime) {
    this.tripId = UUID.randomUUID().toString();
    this.driverId = driverId;
    this.destination = destination;
    this.scheduledTime = scheduledTime;
    this.status = "SCHEDULED";
    if (riderUserIds != null) this.riderUserIds.addAll(riderUserIds);
  }

  public String getTripId() { return tripId; }
  public String getDriverId() { return driverId; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getScheduledTime() { return scheduledTime; }
  public String getDestination() { return destination; }
  public List<String> getRiderUserIds() { return riderUserIds; }
}
