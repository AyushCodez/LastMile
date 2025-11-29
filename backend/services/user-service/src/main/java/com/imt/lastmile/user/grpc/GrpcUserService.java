package com.imt.lastmile.user.grpc;

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
import net.devh.boot.grpc.server.service.GrpcService;



@GrpcService
public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {
  private final UserRepository repo;
  private final PasswordEncoder passwordEncoder;
  private final com.imt.lastmile.security.JwtUtil jwtUtil;

  public GrpcUserService(UserRepository repo, PasswordEncoder passwordEncoder, com.imt.lastmile.security.JwtUtil jwtUtil) {
    this.repo = repo;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
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
    
    String token = jwtUtil.generateToken(opt.get().getId(), opt.get().getRole().name());
    
    // We don't have exact expiry time from JwtUtil easily exposed without decoding, 
    // but for now we can just return the token. The proto expects timestamp, 
    // we can either update JwtUtil to return it or just send current time + default.
    // For simplicity, let's just send the token. The client usually decodes it.
    // But the proto has `expires` field.
    // Let's just set it to 24h from now roughly or 0 if not critical.
    long now = System.currentTimeMillis();
    long exp = now + 86400000; // 24h
    
    responseObserver.onNext(AuthResponse.newBuilder()
      .setJwt(token)
      .setExpires(com.google.protobuf.TimestampProto.Timestamp.newBuilder().setSeconds(exp / 1000).build())
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
