package com.imt.lastmile.security;

import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {
  @Bean
  public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  public Algorithm jwtAlgorithm(@Value("${security.jwt.secret:test-secret}") String secret) {
    return Algorithm.HMAC256(secret);
  }

  @Bean
  public Long jwtExpiryMinutes(@Value("${security.jwt.expiresMinutes:15}") Long expires) { return expires; }
}
