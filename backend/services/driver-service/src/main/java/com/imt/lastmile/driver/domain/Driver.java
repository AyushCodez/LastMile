package com.imt.lastmile.driver.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "drivers")
public class Driver {
  @Id
  @Column(name = "driver_id", length = 36, nullable = false, updatable = false)
  private String driverId;

  @Column(name = "user_id", length = 36, nullable = false)
  private String userId;

  @Column(name = "vehicle_no", nullable = false)
  private String vehicleNo;

  @Column(name = "capacity", nullable = false)
  private int capacity;

  @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<Route> routes = new ArrayList<>();

  protected Driver() {}

  public Driver(String userId, String vehicleNo, int capacity) {
    this.driverId = UUID.randomUUID().toString();
    this.userId = userId;
    this.vehicleNo = vehicleNo;
    this.capacity = capacity;
  }

  public String getDriverId() { return driverId; }
  public String getUserId() { return userId; }
  public String getVehicleNo() { return vehicleNo; }
  public int getCapacity() { return capacity; }
  public List<Route> getRoutes() { return routes; }

  public void addRoute(Route r) {
    r.setDriver(this);
    routes.add(r);
  }
}
