package com.imt.lastmile.station.repo;

import com.imt.lastmile.station.domain.StationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<StationEntity, String> {}
