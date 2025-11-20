package com.imt.lastmile.rider.repo;

import com.imt.lastmile.rider.domain.RideIntent;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RideIntentRepository extends JpaRepository<RideIntent, String> {
  Optional<RideIntent> findByIntentId(String intentId);
}
