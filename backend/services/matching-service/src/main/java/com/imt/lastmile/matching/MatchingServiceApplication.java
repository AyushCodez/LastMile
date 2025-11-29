package com.imt.lastmile.matching;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MatchingServiceApplication {
  public static void main(String[] args) { SpringApplication.run(MatchingServiceApplication.class, args); }

  @org.springframework.context.annotation.Bean
  public org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate(org.springframework.data.redis.connection.RedisConnectionFactory connectionFactory) {
    org.springframework.data.redis.core.RedisTemplate<String, Object> template = new org.springframework.data.redis.core.RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    
    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    
    template.setKeySerializer(new org.springframework.data.redis.serializer.StringRedisSerializer());
    template.setValueSerializer(new org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer(mapper));
    return template;
  }
}
