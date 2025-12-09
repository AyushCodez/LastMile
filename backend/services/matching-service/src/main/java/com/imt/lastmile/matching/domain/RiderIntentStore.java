package com.imt.lastmile.matching.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Component;

@Component
public class RiderIntentStore {
  private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RiderIntentStore.class);
  private final RedisTemplate<String, Object> redisTemplate;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public RiderIntentStore(RedisTemplate<String, Object> redisTemplate) {
    this.redisTemplate = redisTemplate;
    // Register JavaTimeModule for Instant serialization if not already configured globally
    objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
  }

  private String getKey(String stationAreaId) {
    return "station:" + stationAreaId + ":intents";
  }

  public void add(RiderIntent intent) {
    String key = getKey(intent.getStationAreaId());
    double score = intent.getArrivalTime().getEpochSecond();
    log.info("Adding rider {} to key: {} with score: {}", intent.getRiderId(), key, score);
    
    Boolean result = redisTemplate.opsForZSet().add(key, intent, score);
    log.info("Add result: {}", result);
    
    // Set TTL for the station key (e.g., 1 hour) to cleanup old data
    redisTemplate.expire(key, 3600, TimeUnit.SECONDS);
  }

  /**
   * Fetch candidate riders for a station matching destination.
   * Uses Redis transactions to ensure atomicity.
   */
  public List<RiderIntent> takeMatching(String stationAreaId, String destinationAreaId, int limit, int driverEtaMinutes) {
    String key = getKey(stationAreaId);
    
    // Cleanup expired intents (older than 30 minutes)
    double cutoff = Instant.now().minusSeconds(1800).getEpochSecond();
    redisTemplate.opsForZSet().removeRangeByScore(key, 0, cutoff);
    
    Instant driverArrival = Instant.now().plusSeconds(driverEtaMinutes * 60L);
    return executeTransaction(key, stationAreaId, destinationAreaId, limit, driverArrival);
  }

  @SuppressWarnings("unchecked")
  private List<RiderIntent> executeTransaction(String key, String stationAreaId, String destinationAreaId, int limit, Instant driverArrival) {
    // Execute in a transaction
    // We return a List containing [execResults, matchedRiders]
    List<Object> result = redisTemplate.execute(new SessionCallback<List<Object>>() {
      public List<Object> execute(RedisOperations operations) throws DataAccessException {
        // 1. Watch the key for optimistic locking
        operations.watch(key);

        // 2. Read all candidates (ZSET is sorted by arrival time)
        Set<Object> candidates = operations.opsForZSet().range(key, 0, -1);
        
        List<RiderIntent> matched = new ArrayList<>();
        if (candidates != null) {
          for (Object obj : candidates) {
            RiderIntent r = convert(obj);
            if (r == null) continue;

            boolean destMatch = destinationAreaId == null || destinationAreaId.isBlank() || destinationAreaId.equalsIgnoreCase(r.getDestinationAreaId());
            boolean timeMatch = r.getArrivalTime().isBefore(driverArrival.plusSeconds(300)); // 5 min buffer

            if (destMatch && timeMatch) {
              matched.add(r);
              if (matched.size() >= limit) break;
            }
          }
        }

        // 3. Start transaction
        operations.multi();

        // 4. Remove matched riders
        for (RiderIntent r : matched) {
          operations.opsForZSet().remove(key, r);
        }

        // 5. Commit
        List<Object> execResults = operations.exec();
        
        // Return both the transaction results and the matched list
        // Note: execResults will be null if transaction failed (CAS)
        if (execResults == null) {
            return null;
        }
        return List.of(execResults, matched);
      }
    });

    // Check if transaction succeeded
    if (result != null && !result.isEmpty()) {
        List<Object> execResults = (List<Object>) result.get(0);
        if (execResults != null && !execResults.isEmpty()) {
            // Transaction committed successfully
            return (List<RiderIntent>) result.get(1);
        }
    }
    
    // Transaction failed (CAS failure or empty), return empty list
    return List.of();
  }

  private RiderIntent convert(Object obj) {
    if (obj instanceof RiderIntent) return (RiderIntent) obj;
    try {
      return objectMapper.convertValue(obj, RiderIntent.class);
    } catch (Exception e) {
      log.error("Conversion failed for object: {}", obj, e);
      return null;
    }
  }
}
