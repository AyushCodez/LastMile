package com.imt.lastmile.driver.repo;

import com.imt.lastmile.driver.domain.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {
  java.util.List<Driver> findByUserId(String userId);
}
