package com.imt.lastmile.station.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "area_edges")
public class AreaEdgeEntity {
  @EmbeddedId
  private EdgeKey key;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("fromAreaId")
  @JoinColumn(name = "from_area_id")
  private AreaEntity from;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_area_id", insertable = false, updatable = false)
  private AreaEntity to;

  @Column(name = "travel_minutes", nullable = false)
  private int travelMinutes;

  protected AreaEdgeEntity() {}

  public EdgeKey getKey() { return key; }
  public AreaEntity getFrom() { return from; }
  public AreaEntity getTo() { return to; }
  public int getTravelMinutes() { return travelMinutes; }

  @Embeddable
  public static class EdgeKey implements java.io.Serializable {
    @Column(name = "from_area_id", length = 64)
    private String fromAreaId;

    @Column(name = "to_area_id", length = 64)
    private String toAreaId;

    public EdgeKey() {}

    public EdgeKey(String from, String to) {
      this.fromAreaId = from;
      this.toAreaId = to;
    }

    public String getFromAreaId() { return fromAreaId; }
    public String getToAreaId() { return toAreaId; }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (!(o instanceof EdgeKey other)) return false;
      return java.util.Objects.equals(fromAreaId, other.fromAreaId)
          && java.util.Objects.equals(toAreaId, other.toAreaId);
    }

    @Override
    public int hashCode() {
      return java.util.Objects.hash(fromAreaId, toAreaId);
    }
  }
}
