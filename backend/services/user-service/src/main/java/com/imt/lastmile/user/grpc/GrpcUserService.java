package com.imt.lastmile.user.grpc;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.imt.lastmile.user.domain.User;
import com.imt.lastmile.user.repo.UserRepository;
import io.grpc.stub.StreamObserver;
import lastmile.user.UserServiceGrpc;
import lastmile.user.CreateUserRequest;
import lastmile.user.CreateUserResponse;
import lastmile.user.Credentials;
import lastmile.user.AuthResponse;
import lastmile.UserId;
import lastmile.user.UserProfile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {
  private final UserRepository repo;
  private final PasswordEncoder passwordEncoder;
  private final Algorithm alg;
  private final long expiresMinutes;

  public GrpcUserService(UserRepository repo, PasswordEncoder passwordEncoder, Algorithm alg, Long expiresMinutes) {
    this.repo = repo;
    this.passwordEncoder = passwordEncoder;
    this.alg = alg;
    this.expiresMinutes = expiresMinutes;
  }

  @Override
  public void createUser(CreateUserRequest request, StreamObserver<CreateUserResponse> responseObserver) {
    User.Role role = request.getRole() == CreateUserRequest.Role.DRIVER ? User.Role.DRIVER : User.Role.RIDER;
    String hashed = passwordEncoder.encode(request.getPassword());
    User u = new User(request.getName(), request.getEmail(), hashed, role);
    repo.save(u);
    responseObserver.onNext(CreateUserResponse.newBuilder().setId(u.getId()).build());
    responseObserver.onCompleted();
  }

  @Override
  public void authenticate(Credentials request, StreamObserver<AuthResponse> responseObserver) {
    var opt = repo.findByEmail(request.getEmail())
      .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()));
    if (opt.isEmpty()) {
      responseObserver.onNext(AuthResponse.newBuilder().setJwt("INVALID").build());
      responseObserver.onCompleted();
      return;
    }
  Instant exp = Instant.now().plus(expiresMinutes, ChronoUnit.MINUTES);
    String token = JWT.create().withSubject(opt.get().getId()).withExpiresAt(java.util.Date.from(exp)).sign(alg);
    responseObserver.onNext(AuthResponse.newBuilder()
      .setJwt(token)
  .setExpires(com.google.protobuf.TimestampProto.Timestamp.newBuilder().setSeconds(exp.getEpochSecond()).build())
      .build());
    responseObserver.onCompleted();
  }

  @Override
  public void getUser(UserId request, StreamObserver<UserProfile> responseObserver) {
    var opt = repo.findById(request.getId());
    if (opt.isEmpty()) {
      responseObserver.onNext(UserProfile.newBuilder().build());
      responseObserver.onCompleted();
      return;
    }
    User u = opt.get();
    responseObserver.onNext(UserProfile.newBuilder()
      .setId(u.getId())
      .setName(u.getName())
      .setEmail(u.getEmail())
      .setRole(u.getRole().name())
      .build());
    responseObserver.onCompleted();
  }
}
