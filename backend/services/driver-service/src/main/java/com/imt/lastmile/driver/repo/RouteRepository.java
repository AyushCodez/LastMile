package com.imt.lastmile.driver.repo;

import com.imt.lastmile.driver.domain.Route;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, String> {
  @EntityGraph(attributePaths = "stops")
  List<Route> findByDriver_DriverId(String driverId);

  @EntityGraph(attributePaths = "stops")
  Optional<Route> findByRouteIdAndDriver_DriverId(String routeId, String driverId);
}
