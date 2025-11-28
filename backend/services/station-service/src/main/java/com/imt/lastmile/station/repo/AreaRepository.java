package com.imt.lastmile.station.repo;

import com.imt.lastmile.station.domain.AreaEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaRepository extends JpaRepository<AreaEntity, String> {
  @Override
  @EntityGraph(attributePaths = {"neighbours", "neighbours.to"})
  List<AreaEntity> findAll();

  @EntityGraph(attributePaths = {"neighbours", "neighbours.to"})
  Optional<AreaEntity> findByAreaId(String areaId);
}
