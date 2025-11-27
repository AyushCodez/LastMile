package com.imt.lastmile.location.repo;

import com.imt.lastmile.location.domain.DriverTelemetryEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverTelemetryRepository extends JpaRepository<DriverTelemetryEntity, String> {
  Optional<DriverTelemetryEntity> findByDriverId(String driverId);
}
