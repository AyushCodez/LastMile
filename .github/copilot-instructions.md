# LastMile Project Instructions

## Architecture Overview
- **Microservices:** Spring Boot 3.2.0 + gRPC (via `net.devh:grpc-server-spring-boot-starter`).
- **Communication:** gRPC is the primary inter-service protocol. All protobuf definitions reside in `backend/services/proto-common`.
- **Database:** PostgreSQL 16. Each service manages its own tables (see `backend/db/schema.sql` for reference schema).
- **Security:** JWT-based authentication. `user-service` issues tokens; `security-common` provides validation logic.

## Critical Workflows

### Build & Run
- **Root Build:** `mvn clean install` (builds all modules).
- **Protobuf Changes:** If you modify `.proto` files in `proto-common`, you **must** rebuild that module first:
  ```bash
  ./mvnw -pl services/proto-common clean install
  ```
- **Run Service:**
  ```bash
  ./mvnw -pl services/user-service spring-boot:run
  ```
- **Profiles:** Use `local` profile for development (e.g., `-Dspring.profiles.active=local`).

### gRPC Implementation Pattern
- **Definition:** Define services in `backend/services/proto-common/src/main/proto/*.proto`.
- **Implementation:**
  - Annotate implementation classes with `@GrpcService`.
  - Extend the generated `*ImplBase` class (e.g., `UserServiceGrpc.UserServiceImplBase`).
  - Use `StreamObserver<T>` for responses.
  - **Example:**
    ```java
    @GrpcService
    public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {
        @Override
        public void getUser(UserId request, StreamObserver<UserProfile> responseObserver) {
            // ... logic ...
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }
    ```

## Code Conventions
- **Java Version:** Java 17.
- **Entities:** Standard JPA Entities (no Lombok). Use protected no-args constructor for JPA.
- **DTOs:** Use Protobuf generated classes for API contracts.
- **Package Structure:** `com.imt.lastmile.<service>`.
- **Ports:** See `SERVICES.md` for specific HTTP/gRPC port assignments (e.g., User: 8081/9091).

## Common Issues
- **Compilation Errors:** If generated gRPC classes are missing, run `mvn clean install` on `proto-common`.
- **Database:** Ensure Postgres is running (`docker-compose up`) and schema is applied (`backend/db/schema.sql`).
