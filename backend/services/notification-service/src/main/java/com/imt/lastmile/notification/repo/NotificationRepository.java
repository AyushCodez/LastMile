package com.imt.lastmile.notification.repo;

import com.imt.lastmile.notification.domain.NotificationEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
  List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
