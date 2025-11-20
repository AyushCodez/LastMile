package com.imt.lastmile.matching.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/** In-memory store for rider intents keyed by station. Not production-ready. */
public class RiderIntentStore {
  private final Map<String, List<RiderIntent>> byStation = new ConcurrentHashMap<>();

  /** Adds a synthetic rider intent (placeholder until rider-service integration). */
  public RiderIntent addSynthetic(String stationId, String destination) {
    String riderId = "r-" + UUID.randomUUID().toString().substring(0, 8);
    RiderIntent intent = new RiderIntent(riderId, stationId, destination, Instant.now());
    byStation.computeIfAbsent(stationId, k -> Collections.synchronizedList(new ArrayList<>())).add(intent);
    return intent;
  }

  /** Fetch candidate riders for a station matching destination (FIFO order). */
  public List<RiderIntent> takeMatching(String stationId, String destination, int limit) {
    List<RiderIntent> list = byStation.getOrDefault(stationId, List.of());
    if (list.isEmpty()) return List.of();
    List<RiderIntent> matched = list.stream()
      .filter(r -> destination == null || destination.isBlank() || destination.equalsIgnoreCase(r.getDestination()))
      .sorted((a,b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
      .limit(limit)
      .collect(Collectors.toList());
    // remove matched from store
    if (!matched.isEmpty()) {
      list.removeAll(matched);
    }
    return matched;
  }
}
