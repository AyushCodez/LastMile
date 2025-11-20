package com.imt.lastmile.user.security;

import net.devh.boot.grpc.server.interceptor.GlobalServerInterceptorConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcSecurityConfig {
  @Bean
  GlobalServerInterceptorConfigurer addJwtInterceptor(JwtServerInterceptor jwtServerInterceptor) {
    return registry -> registry.add(jwtServerInterceptor);
  }
}
