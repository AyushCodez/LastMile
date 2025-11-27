package com.imt.lastmile.station.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "areas")
public class AreaEntity {
  @Id
  @Column(name = "area_id", length = 64, nullable = false, updatable = false)
  private String areaId;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "is_station", nullable = false)
  private boolean station;

  @OneToMany(mappedBy = "from", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<AreaEdgeEntity> neighbours = new ArrayList<>();

  protected AreaEntity() {}

  public String getAreaId() { return areaId; }
  public String getName() { return name; }
  public boolean isStation() { return station; }
  public List<AreaEdgeEntity> getNeighbours() { return neighbours; }
}
