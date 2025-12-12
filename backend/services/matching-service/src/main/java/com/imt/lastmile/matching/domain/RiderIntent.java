package com.imt.lastmile.matching.domain;

import java.time.Instant;

/** Simple in-memory representation of a rider waiting at a station for a trip. */
public class RiderIntent {
  private final String riderId;
  private final String stationAreaId;
  private final String destinationAreaId;
  private final Instant createdAt;
  private final Instant arrivalTime;
  private final int partySize;

  public RiderIntent() {
    this.riderId = null;
    this.stationAreaId = null;
    this.destinationAreaId = null;
    this.createdAt = null;
    this.arrivalTime = null;
    this.partySize = 1;
  }

  public RiderIntent(String riderId, String stationAreaId, String destinationAreaId, Instant createdAt, Instant arrivalTime, int partySize) {
    this.riderId = riderId;
    this.stationAreaId = stationAreaId;
    this.destinationAreaId = destinationAreaId;
    this.createdAt = createdAt;
    this.arrivalTime = arrivalTime;
    this.partySize = partySize;
  }

  public String getRiderId() { return riderId; }
  public String getStationAreaId() { return stationAreaId; }
  public String getDestinationAreaId() { return destinationAreaId; }
  public Instant getCreatedAt() { return createdAt; }
  public Instant getArrivalTime() { return arrivalTime; }
  public int getPartySize() { return partySize; }
}
