package com.imt.lastmile.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  public Algorithm jwtAlgorithm(JwtProperties props, Environment env) {
    String secret = props.getSecret();
    // Fail fast in production profile if secret is weak or default
    boolean prod = false;
    for (String profile : env.getActiveProfiles()) {
      if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) { prod = true; break; }
    }
    if (prod) {
      if (secret == null || secret.length() < 32 || "lastmilecloud".equals(secret)) {
        throw new IllegalStateException("Weak JWT secret detected in production. Set JWT_SECRET env variable to a strong value (>=32 chars)." );
      }
    }
    return Algorithm.HMAC256(secret);
  }

  @Bean
  public JWTVerifier jwtVerifier(Algorithm alg, JwtProperties props) {
    var builder = JWT.require(alg);
    if (props.getIssuer() != null && !props.getIssuer().isBlank()) builder.withIssuer(props.getIssuer());
    if (props.getAudience() != null && !props.getAudience().isBlank()) builder.withAudience(props.getAudience());
    return builder.build();
  }

  @Bean
  public Long jwtExpiryMinutes(JwtProperties props) { return props.getExpiresMinutes(); }
}
