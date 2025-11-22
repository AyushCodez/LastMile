# LastMile

## Build and run

Prerequisites:

Database setup (default connection is to a local database named `lastmile`):
	- File: `backend/db/schema.sql`
	- `DB_URL` (default: `jdbc:postgresql://localhost:5432/lastmile`)
	- `DB_USER` (default: `postgres`)
	- `DB_PASSWORD` (default: `postgres`)
	- Optional roles script: `backend/db/create_roles.sql`

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

Configuration (override via env vars or an `.env.local` file):

- `JWT_SECRET` (no production default – must be strong, >=32 chars)
- `JWT_EXPIRES_MINUTES` (default `60`): token lifetime in minutes
- `JWT_ISSUER` (default `lastmile-cloud`): issuer claim included & verified
- `JWT_AUDIENCE` (default `lastmile-users`): audience claim included & verified

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
- For production, you MUST set a strong `JWT_SECRET` via environment variable (>=32 random characters). The app will fail fast if a weak/default secret is used while the `prod` profile is active.
- Issuer & audience are verified by a shared `JWTVerifier` bean.
- Other services can adopt the same pattern by injecting `JWTVerifier` and `Algorithm` from the shared `security-common` module.

### Local environment & secrets

1. Copy `.env.example` to `.env.local` and customize for your user and password.
2. Export variables or use a tool like `direnv` / docker-compose to load them.
3. `.env.local` is ignored by git so each developer can keep personal DB credentials.

Example:
```bash
cp .env.example .env.local
openssl rand -hex 32 # generate secret
echo "JWT_SECRET=<paste_here>" >> .env.local
```

Then run:
```bash
source .env.local && cd backend && ./mvnw spring-boot:run -pl services/user-service
```

### Database configuration (development vs production)

Profiles:
- Development (default): uses `application.properties` with safe local defaults; can spin up Postgres via docker-compose.
- Production: activate with `SPRING_PROFILES_ACTIVE=prod` → loads `application-prod.properties` with mandatory env-driven datasource settings and no insecure fallbacks.

Environment variables (required in prod):
- `DB_URL` (e.g. `jdbc:postgresql://prod-host:5432/lastmile`)
- `DB_USER` / `DB_PASSWORD` (least-privilege role; avoid superuser)
- `JWT_SECRET` (strong secret; app fails fast if weak)
- `JWT_ISSUER`, `JWT_AUDIENCE` (optional but recommended for claim enforcement)
- `DB_POOL_SIZE` (tune based on connection limits; default 10)

### Running Postgres locally (no containers)

Install PostgreSQL directly (macOS example):
```bash
brew install postgresql@16
brew services start postgresql@16
```
Create database & user (adjust username/password):
```bash
createuser --interactive your_local_username
createdb lastmile
psql -d lastmile -c "alter user your_local_username with password 'your_local_password';"
psql -d lastmile -f backend/db/schema.sql
```
Optional role script example:
```bash
psql -d postgres -f backend/db/create_roles.sql
```
Local profile usage:
1. Copy `backend/services/user-service/src/main/resources/application-local.properties.example` to `application-local.properties` and fill credentials.
2. Run:
```bash
SPRING_PROFILES_ACTIVE=local ./mvnw -pl services/user-service spring-boot:run
```

### Production checklist

- Provide secrets via environment variables or a secrets manager (Kubernetes Secrets, AWS Parameter Store, etc.).
- Use distinct DB roles per microservice with limited grants (select/insert/update only needed tables).
- Enable SSL/TLS on the Postgres connection (`?sslmode=require`).
- Rotate `JWT_SECRET` periodically (consider key versioning or move to asymmetric keys).
- Monitor connection pool (Hikari metrics) and adjust `DB_POOL_SIZE`.
- Back up the database (logical pg_dump or managed service automated backups).

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