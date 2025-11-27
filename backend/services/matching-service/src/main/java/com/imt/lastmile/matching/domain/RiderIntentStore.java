package com.imt.lastmile.matching.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/** In-memory store for rider intents keyed by station area. Not production-ready. */
public class RiderIntentStore {
  private final Map<String, List<RiderIntent>> byStation = new ConcurrentHashMap<>();

  /** Adds a synthetic rider intent (placeholder until rider-service integration). */
  public RiderIntent addSynthetic(String stationAreaId, String destinationAreaId) {
    String riderId = "r-" + UUID.randomUUID().toString().substring(0, 8);
    RiderIntent intent = new RiderIntent(riderId, stationAreaId, destinationAreaId, Instant.now());
    byStation.computeIfAbsent(stationAreaId, k -> Collections.synchronizedList(new ArrayList<>())).add(intent);
    return intent;
  }

  /** Fetch candidate riders for a station matching destination (FIFO order). */
  public List<RiderIntent> takeMatching(String stationAreaId, String destinationAreaId, int limit) {
    List<RiderIntent> list = byStation.getOrDefault(stationAreaId, List.of());
    if (list.isEmpty()) return List.of();
    List<RiderIntent> matched = list.stream()
      .filter(r -> destinationAreaId == null || destinationAreaId.isBlank() || destinationAreaId.equalsIgnoreCase(r.getDestinationAreaId()))
      .sorted((a,b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
      .limit(limit)
      .collect(Collectors.toList());
    if (!matched.isEmpty()) {
      list.removeAll(matched);
    }
    return matched;
  }
}
