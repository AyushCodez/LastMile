package com.imt.lastmile.matching.domain;

import java.time.Instant;

/** Simple in-memory representation of a rider waiting at a station for a trip. */
public class RiderIntent {
  private final String riderId;
  private final String stationId;
  private final String destination;
  private final Instant createdAt;

  public RiderIntent(String riderId, String stationId, String destination, Instant createdAt) {
    this.riderId = riderId;
    this.stationId = stationId;
    this.destination = destination;
    this.createdAt = createdAt;
  }

  public String getRiderId() { return riderId; }
  public String getStationId() { return stationId; }
  public String getDestination() { return destination; }
  public Instant getCreatedAt() { return createdAt; }
}
