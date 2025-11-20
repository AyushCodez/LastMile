# LastMile

## Build and run

Prerequisites:

Database setup (default connection is to a local database named `lastmile`):
	- File: `backend/db/schema.sql`
	- `DB_URL` (default: `jdbc:postgresql://localhost:5432/lastmile`)
	- `DB_USER` (default: `postgres`)
	- `DB_PASSWORD` (default: `postgres`)

Build all services:
```bash
cd backend
mvn -DskipTests clean install
```

## JWT authentication

We added username/password authentication with JWT issuance in the `user-service` via gRPC:

- Create user: `UserService.CreateUser`
- Authenticate (login): `UserService.Authenticate` → returns a signed JWT and expiry
- Protected calls: All other `user-service` gRPC methods require `Authorization: Bearer <token>` metadata

Configuration (override via env vars):

- `JWT_SECRET` (default `change-me`): HMAC secret used to sign/verify tokens
- `JWT_EXPIRES_MINUTES` (default `60`): token lifetime in minutes

The `user-service` secures passwords using BCrypt and validates on login. Tokens are signed with HS256 (Auth0 java-jwt) and enforced by a global gRPC server interceptor.

Example usage (pseudocode):

1) Create user
```
rpc CreateUser(CreateUserRequest) returns (CreateUserResponse)
// name, email, password, role (RIDER|DRIVER)
```

2) Login to get JWT
```
rpc Authenticate(Credentials) returns (AuthResponse)
// set jwt = AuthResponse.jwt
```

3) Call protected APIs with metadata
```
Authorization: Bearer <jwt>
```

Notes:
- For production, set a strong `JWT_SECRET` via environment variable.
- Other services can adopt the same pattern by copying the interceptor and reading the same env vars.

Run a service (example: user-service):
```bash
cd backend/services/user-service
mvn spring-boot:run
```

Each service exposes gRPC and HTTP management endpoints; ports are configurable:
- `HTTP_PORT` (defaults: user 8081, driver 8082, rider 8083, location 8086, station 8085, matching 8087, trip 8084, notification 8088)
- `GRPC_PORT` (defaults: user 9091, driver 9092, rider 9093, location 9096, station 9095, matching 9097, trip 9094, notification 9098)

### Notes on protobuf build

We use a dedicated `proto-common` module to generate all protobuf and gRPC Java classes once, then each service depends on it. If you ever hit an intermittent compile error in `proto-common` referencing generated `grpc-java` files, rebuild that module first and then the full reactor:

```bash
cd backend/services/proto-common
mvn -DskipTests clean install

cd ../..
mvn -DskipTests clean install
```

This setup avoids per-service codegen races and keeps builds stable.