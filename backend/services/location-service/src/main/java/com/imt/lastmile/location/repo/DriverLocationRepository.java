package com.imt.lastmile.location.repo;

import com.imt.lastmile.location.domain.DriverLocationEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverLocationRepository extends JpaRepository<DriverLocationEntity, Long> {
  Optional<DriverLocationEntity> findFirstByDriverIdOrderByTsDesc(String driverId);
}
