package com.imt.lastmile.driver.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

  protected AreaEntity() {}

  public String getAreaId() { return areaId; }
  public String getName() { return name; }
  public boolean isStation() { return station; }
}
