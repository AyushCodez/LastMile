package com.imt.lastmile.user.repo;

import com.imt.lastmile.user.domain.User;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final Map<String, User> byId = new ConcurrentHashMap<>();
  private final Map<String, User> byEmail = new ConcurrentHashMap<>();

  public User save(User u) {
    byId.put(u.getId(), u);
    byEmail.put(u.getEmail(), u);
    return u;
  }
  public Optional<User> findById(String id) { return Optional.ofNullable(byId.get(id)); }
  public Optional<User> findByEmail(String email) { return Optional.ofNullable(byEmail.get(email)); }
}
