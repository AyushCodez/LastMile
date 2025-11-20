package com.imt.lastmile.user.security;

import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.grpc.*;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.stereotype.Component;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

@Component
@GrpcGlobalServerInterceptor
public class JwtServerInterceptor implements ServerInterceptor {
  private static final Metadata.Key<String> AUTHORIZATION = Metadata.Key.of("authorization", ASCII_STRING_MARSHALLER);
  private final JWTVerifier verifier;

  public JwtServerInterceptor(Algorithm algorithm) {
    this.verifier = com.auth0.jwt.JWT.require(algorithm).build();
  }

  @Override
  public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {
    String fullMethodName = call.getMethodDescriptor().getFullMethodName();
    // Allow unauthenticated for user-service public methods
    if (fullMethodName.endsWith("/Authenticate") || fullMethodName.endsWith("/CreateUser")) {
      return next.startCall(call, headers);
    }
    String auth = headers.get(AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      call.close(Status.UNAUTHENTICATED.withDescription("Missing Bearer token"), new Metadata());
      return new ServerCall.Listener<>() {};
    }
    String token = auth.substring("Bearer ".length());
    try {
      DecodedJWT jwt = verifier.verify(token);
      Context ctx = Context.current().withValue(Context.key("userId"), jwt.getSubject());
      return Contexts.interceptCall(ctx, call, headers, next);
    } catch (Exception e) {
      call.close(Status.UNAUTHENTICATED.withDescription("Invalid token"), new Metadata());
      return new ServerCall.Listener<>() {};
    }
  }
}
