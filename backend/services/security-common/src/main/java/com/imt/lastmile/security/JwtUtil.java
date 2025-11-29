package com.imt.lastmile.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret:defaultSecretKeyForDevelopmentOnly1234567890}")
  private String secret;

  @Value("${jwt.expiration:86400000}") // 24 hours
  private long expiration;

  public String generateToken(String userId, String role) {
    Algorithm algorithm = Algorithm.HMAC256(secret);
    return JWT.create()
        .withSubject(userId)
        .withClaim("role", role)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
        .sign(algorithm);
  }

  public DecodedJWT validateToken(String token) {
    try {
      Algorithm algorithm = Algorithm.HMAC256(secret);
      JWTVerifier verifier = JWT.require(algorithm).build();
      return verifier.verify(token);
    } catch (Exception e) {
      return null;
    }
  }
}
