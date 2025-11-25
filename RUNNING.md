## How to run the LastMile project locally

This document explains step-by-step how to get the project up and running on a developer machine.

### 1) Prepare local Postgres

Install Postgres (macOS example):
```bash
brew install postgresql@16
brew services start postgresql@16
```

Create a database and user (replace `your_local_username` / `your_local_password`):
```bash
createuser --interactive your_local_username
createdb lastmile
psql -d lastmile -c "alter user your_local_username with password 'your_local_password';"
psql -d lastmile -f backend/db/schema.sql
```

### 2) Local application profile

Copy the example local properties file and edit credentials:
```bash
cp backend/services/user-service/src/main/resources/application-local.properties.example \
   backend/services/user-service/src/main/resources/application-local.properties
# edit username/password and jwt.secret
```

Start the `user-service` using the `local` profile:
```bash
cd backend
SPRING_PROFILES_ACTIVE=local ./mvnw -pl services/user-service spring-boot:run
```

### 3) Full reactor build

To build the entire multi-module project (generates protos in `proto-common` and builds services):
```bash
cd backend
./mvnw -DskipTests clean install
```

### 4) Protobuf & generated code notes

If you change `.proto` files, regenerate via `proto-common`:
```bash
cd backend/services/proto-common
./mvnw -DskipTests clean install
cd ../..
./mvnw -DskipTests clean install
```

### 5) Tests

Run all tests for a single module:
```bash
cd backend/services/user-service
./mvnw test
```

### 6) Ports & management endpoints

Each service prints its HTTP and gRPC ports on startup. Management endpoints (Actuator) are available at the configured HTTP port and can be used for health checks.

### 7) Common troubleshooting

- If you see proto-generation issues, build `proto-common` first.
- If a service fails because of DB credentials, verify `application-local.properties` values or environment variables.
