package com.imt.lastmile.driver.repo;

import com.imt.lastmile.driver.domain.AreaEdgeEntity;
import com.imt.lastmile.driver.domain.AreaEdgeEntity.EdgeKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaEdgeRepository extends JpaRepository<AreaEdgeEntity, EdgeKey> {
  boolean existsByKey(EdgeKey key);
  default boolean hasEdge(String fromAreaId, String toAreaId) {
    return existsByKey(new EdgeKey(fromAreaId, toAreaId));
  }
}
