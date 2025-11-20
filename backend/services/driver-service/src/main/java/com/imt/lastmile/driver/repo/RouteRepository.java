package com.imt.lastmile.driver.repo;

import com.imt.lastmile.driver.domain.Route;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, String> {
  List<Route> findByDriver_DriverId(String driverId);
}
