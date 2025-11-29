package com.imt.lastmile.user.grpc;

import com.imt.lastmile.user.domain.User;
import com.imt.lastmile.user.repo.UserRepository;
import com.imt.lastmile.security.JwtUtil;
import lastmile.user.AuthResponse;
import lastmile.user.Credentials;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import io.grpc.stub.StreamObserver;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

class GrpcUserServiceTest {
  private UserRepository repo;
  private BCryptPasswordEncoder encoder;
  private JwtUtil jwtUtil;
  private GrpcUserService service;

  @BeforeEach
  void setup() {
    repo = Mockito.mock(UserRepository.class);
    encoder = new BCryptPasswordEncoder();
    jwtUtil = Mockito.mock(JwtUtil.class);
    service = new GrpcUserService(repo, encoder, jwtUtil);
  }

  @Test
  void authenticateSuccessReturnsJwtAndExpiry() {
    String rawPass = "pw123";
    User u = new User("Name","email@test.com", encoder.encode(rawPass), User.Role.RIDER);
    // Provide deterministic user id by mocking repository return with preset UUID inside domain object
    Mockito.when(repo.findByEmail("email@test.com")).thenReturn(Optional.of(u));
    Mockito.when(jwtUtil.generateToken(eq(u.getId()), anyString())).thenReturn("mock-token");

    Credentials req = Credentials.newBuilder().setEmail("email@test.com").setPassword(rawPass).build();
    AtomicReference<AuthResponse> captured = new AtomicReference<>();
    service.authenticate(req, observer(captured));

    AuthResponse resp = captured.get();
    assertNotNull(resp, "response should be captured");
    assertEquals("mock-token", resp.getJwt(), "jwt should match mock");
    assertTrue(resp.getExpires().getSeconds() > 0, "expiry seconds populated");
  }

  @Test
  void authenticateFailureReturnsInvalid() {
    Mockito.when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
    Credentials req = Credentials.newBuilder().setEmail("bad@test.com").setPassword("nope").build();
    AtomicReference<AuthResponse> captured = new AtomicReference<>();
    service.authenticate(req, observer(captured));
    assertEquals("INVALID", captured.get().getJwt());
  }

  private <T> StreamObserver<T> observer(AtomicReference<T> ref) {
    return new StreamObserver<>() {
      @Override public void onNext(T value) { ref.set(value); }
      @Override public void onError(Throwable t) { fail(t); }
      @Override public void onCompleted() { }
    };
  }
}
