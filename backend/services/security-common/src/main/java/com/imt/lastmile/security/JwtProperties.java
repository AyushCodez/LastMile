package com.imt.lastmile.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
  /** Secret used for HMAC signing */
  private String secret = "lastmilecloud"; // overridden via env JWT_SECRET
  /** Expiration in minutes */
  private long expiresMinutes = 60; // overridden via env JWT_EXPIRES_MINUTES
  /** Optional issuer claim */
  private String issuer = "lastmile-cloud";
  /** Optional single audience claim */
  private String audience = "lastmile-users";

  public String getSecret() { return secret; }
  public void setSecret(String secret) { this.secret = secret; }
  public long getExpiresMinutes() { return expiresMinutes; }
  public void setExpiresMinutes(long expiresMinutes) { this.expiresMinutes = expiresMinutes; }
  public String getIssuer() { return issuer; }
  public void setIssuer(String issuer) { this.issuer = issuer; }
  public String getAudience() { return audience; }
  public void setAudience(String audience) { this.audience = audience; }
}