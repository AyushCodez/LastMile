package com.imt.lastmile.matching.domain;

import java.time.Instant;

/** Simple in-memory representation of a rider waiting at a station for a trip. */
public class RiderIntent {
  private final String riderId;
  private final String stationAreaId;
  private final String destinationAreaId;
  private final Instant createdAt;

  public RiderIntent(String riderId, String stationAreaId, String destinationAreaId, Instant createdAt) {
    this.riderId = riderId;
    this.stationAreaId = stationAreaId;
    this.destinationAreaId = destinationAreaId;
    this.createdAt = createdAt;
  }

  public String getRiderId() { return riderId; }
  public String getStationAreaId() { return stationAreaId; }
  public String getDestinationAreaId() { return destinationAreaId; }
  public Instant getCreatedAt() { return createdAt; }
}
