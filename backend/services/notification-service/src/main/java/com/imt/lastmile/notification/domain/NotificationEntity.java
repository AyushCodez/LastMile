package com.imt.lastmile.notification.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", length = 36, nullable = false)
  private String userId;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "body", nullable = false)
  private String body;

  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadataJson;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected NotificationEntity() {}
  public NotificationEntity(String userId, String title, String body, String metadataJson) {
    this.userId = userId; this.title = title; this.body = body; this.metadataJson = metadataJson;
  }
  public Long getId() { return id; }
  public String getUserId() { return userId; }
  public String getTitle() { return title; }
  public String getBody() { return body; }
  public String getMetadataJson() { return metadataJson; }
  public Instant getCreatedAt() { return createdAt; }
}
