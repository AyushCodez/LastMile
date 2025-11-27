# LastMile

## Build and run

Prerequisites:

Database setup (default connection is to a local database named `lastmile`):
	# LastMile

	LastMile is a small microservice suite that demonstrates a last-mile trip matching system using Spring Boot and gRPC. It includes services for users, drivers, riders, trips, locations, stations, notifications, and a matching engine.

	This repository contains the full backend (multi-module Maven project) and a minimal frontend placeholder. The codebase focuses on deterministic builds, gRPC inter-service communication, JWT-based authentication, and example matching logic.

	Key documentation (split for clarity):

	- `CONFIGURATION.md` — what to set up before running (env vars, profiles, secrets, local config files).
	- `RUNNING.md` — step-by-step instructions to run the project locally and how the services start.
	- `SERVICES.md` — short description of each service and what it does (ports, responsibilities).

	For development you likely want to read `CONFIGURATION.md` first, then follow `RUNNING.md`.

	If you want a quick summary of the repository layout and build, see the top-level `backend/` folder (Maven multi-module). For protobuf generation notes, check `backend/services/proto-common`.

	For security & JWT details, see `CONFIGURATION.md` (these details are intentionally separated from the main README).

	Happy hacking — follow the docs above to get started.
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