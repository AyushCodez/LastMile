package com.imt.lastmile.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import io.grpc.Context;
import io.grpc.Contexts;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.stereotype.Component;

@Component
@GrpcGlobalServerInterceptor
public class AuthInterceptor implements ServerInterceptor {

  private final JwtUtil jwtUtil;

  public static final Context.Key<String> USER_ID_CONTEXT_KEY = Context.key("userId");
  public static final Context.Key<String> USER_ROLE_CONTEXT_KEY = Context.key("userRole");

  private static final Metadata.Key<String> AUTHORIZATION_HEADER =
      Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);

  public AuthInterceptor(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
      ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {

    String authHeader = headers.get(AUTHORIZATION_HEADER);
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      // Allow unauthenticated access to specific services if needed (e.g. login)
      // For now, we reject everything without a token unless it's explicitly public
      // But gRPC interceptors are global. We need a way to exclude login.
      // Allow unauthenticated access to login/register
      String methodName = call.getMethodDescriptor().getFullMethodName();
      if (methodName.endsWith("/Authenticate") || 
          methodName.endsWith("/CreateUser") || 
          methodName.startsWith("grpc.reflection")) {
         return next.startCall(call, headers);
      }
      
      call.close(Status.UNAUTHENTICATED.withDescription("Missing or invalid Authorization header"), headers);
      return new ServerCall.Listener<>() {};
    }

    String token = authHeader.substring(7);
    DecodedJWT jwt = jwtUtil.validateToken(token);

    if (jwt == null) {
      call.close(Status.UNAUTHENTICATED.withDescription("Invalid token"), headers);
      return new ServerCall.Listener<>() {};
    }

    Context context = Context.current()
        .withValue(USER_ID_CONTEXT_KEY, jwt.getSubject())
        .withValue(USER_ROLE_CONTEXT_KEY, jwt.getClaim("role").asString());

    return Contexts.interceptCall(context, call, headers, next);
  }
}
