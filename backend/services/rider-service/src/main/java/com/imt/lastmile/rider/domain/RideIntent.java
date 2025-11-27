package com.imt.lastmile.rider.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ride_intents")
public class RideIntent {
  public enum Status { PENDING, SCHEDULED, PICKED_UP, COMPLETED, CANCELLED }

  @Id
  @Column(name = "intent_id", length = 36, nullable = false, updatable = false)
  private String intentId;

  @Column(name = "user_id", length = 36, nullable = false)
  private String userId;

  @Column(name = "station_area_id", length = 64, nullable = false)
  private String stationAreaId;

  @Column(name = "arrival_time", nullable = false)
  private Instant arrivalTime;

  @Column(name = "destination_area_id", length = 64, nullable = false)
  private String destinationAreaId;

  @Column(name = "party_size", nullable = false)
  private int partySize;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status = Status.PENDING;

  @Column(name = "trip_id", length = 36)
  private String tripId;

  protected RideIntent() {}

  public RideIntent(String userId, String stationAreaId, Instant arrivalTime, String destinationAreaId, int partySize) {
    this.intentId = UUID.randomUUID().toString();
    this.userId = userId;
    this.stationAreaId = stationAreaId;
    this.arrivalTime = arrivalTime;
    this.destinationAreaId = destinationAreaId;
    this.partySize = partySize;
  }

  public String getIntentId() { return intentId; }
  public String getUserId() { return userId; }
  public String getStationAreaId() { return stationAreaId; }
  public Instant getArrivalTime() { return arrivalTime; }
  public String getDestinationAreaId() { return destinationAreaId; }
  public int getPartySize() { return partySize; }
  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }
  public String getTripId() { return tripId; }
  public void setTripId(String tripId) { this.tripId = tripId; }
}
