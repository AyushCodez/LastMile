package com.imt.lastmile.trip.repo;

import com.imt.lastmile.trip.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, String> {
  List<Trip> findByDriverId(String driverId);
  List<Trip> findByRiderUserIdsContaining(String riderId);
}
