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

  @Column(name = "station_id", length = 36, nullable = false)
  private String stationId;

  @Column(name = "arrival_time", nullable = false)
  private Instant arrivalTime;

  @Column(name = "destination", nullable = false)
  private String destination;

  @Column(name = "party_size", nullable = false)
  private int partySize;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status = Status.PENDING;

  @Column(name = "trip_id", length = 36)
  private String tripId;

  protected RideIntent() {}

  public RideIntent(String userId, String stationId, Instant arrivalTime, String destination, int partySize) {
    this.intentId = UUID.randomUUID().toString();
    this.userId = userId;
    this.stationId = stationId;
    this.arrivalTime = arrivalTime;
    this.destination = destination;
    this.partySize = partySize;
  }

  public String getIntentId() { return intentId; }
  public String getUserId() { return userId; }
  public String getStationId() { return stationId; }
  public Instant getArrivalTime() { return arrivalTime; }
  public String getDestination() { return destination; }
  public int getPartySize() { return partySize; }
  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }
  public String getTripId() { return tripId; }
  public void setTripId(String tripId) { this.tripId = tripId; }
}
