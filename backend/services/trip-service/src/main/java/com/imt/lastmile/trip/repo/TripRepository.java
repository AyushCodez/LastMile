package com.imt.lastmile.trip.repo;

import com.imt.lastmile.trip.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, String> {}
