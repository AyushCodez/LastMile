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

  @Column(name = "model")
  private String model;

  @Column(name = "color")
  private String color;

  @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<Route> routes = new ArrayList<>();

  protected Driver() {}

  public Driver(String userId, String vehicleNo, int capacity, String model, String color) {
    this.driverId = UUID.randomUUID().toString();
    this.userId = userId;
    this.vehicleNo = vehicleNo;
    this.capacity = capacity;
    this.model = model;
    this.color = color;
  }

  public String getDriverId() { return driverId; }
  public String getUserId() { return userId; }
  public String getVehicleNo() { return vehicleNo; }
  public int getCapacity() { return capacity; }
  public String getModel() { return model; }
  public String getColor() { return color; }
  public List<Route> getRoutes() { return routes; }

  public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }
  public void setCapacity(int capacity) { this.capacity = capacity; }
  public void setModel(String model) { this.model = model; }
  public void setColor(String color) { this.color = color; }

  public void addRoute(Route r) {
    r.setDriver(this);
    routes.add(r);
  }
}
