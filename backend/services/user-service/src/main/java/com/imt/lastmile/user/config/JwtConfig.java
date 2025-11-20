package com.imt.lastmile.user.config;

import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {
  @Value("${jwt.secret:change-me}")
  private String secret;

  @Value("${jwt.expires.minutes:60}")
  private long expiresMinutes;

  @Bean
  public Algorithm jwtAlgorithm() {
    return Algorithm.HMAC256(secret);
  }

  @Bean
  public Long jwtExpiresMinutes() {
    return expiresMinutes;
  }
}
