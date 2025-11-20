package com.imt.lastmile.driver.repo;

import com.imt.lastmile.driver.domain.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, String> {}
