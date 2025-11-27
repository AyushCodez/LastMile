package com.imt.lastmile.driver.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "area_edges")
public class AreaEdgeEntity {
  @EmbeddedId
  private EdgeKey key;

  @Column(name = "travel_minutes", nullable = false)
  private int travelMinutes;

  protected AreaEdgeEntity() {}

  public EdgeKey getKey() { return key; }
  public int getTravelMinutes() { return travelMinutes; }

  public String getFromAreaId() { return key.fromAreaId; }
  public String getToAreaId() { return key.toAreaId; }

  public static class EdgeKey implements java.io.Serializable {
    @Column(name = "from_area_id", length = 64)
    public String fromAreaId;

    @Column(name = "to_area_id", length = 64)
    public String toAreaId;

    public EdgeKey() {}

    public EdgeKey(String from, String to) {
      this.fromAreaId = from; this.toAreaId = to;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (!(o instanceof EdgeKey other)) return false;
      return java.util.Objects.equals(fromAreaId, other.fromAreaId) &&
        java.util.Objects.equals(toAreaId, other.toAreaId);
    }

    @Override
    public int hashCode() {
      return java.util.Objects.hash(fromAreaId, toAreaId);
    }
  }
}
