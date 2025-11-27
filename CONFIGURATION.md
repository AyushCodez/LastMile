## Configuration checklist — what to configure before you run the project

This document collects the minimal configuration you should set before running the project locally or in a non-dev environment.

### Profiles

- `local` — development on your machine using a host Postgres instance and local properties file. Activate with `SPRING_PROFILES_ACTIVE=local`.
- `prod` — production settings: strict, no insecure defaults. Activate with `SPRING_PROFILES_ACTIVE=prod`.

### Secrets & environment variables

- `JWT_SECRET` — required; set a strong random secret (>=32 chars). Used for HMAC token signing.
- `JWT_EXPIRES_MINUTES` — token lifetime in minutes (default 60).
- `JWT_ISSUER` / `JWT_AUDIENCE` — optional issuer/audience values used and verified by the shared verifier.
- `DB_URL` — JDBC URL for Postgres (e.g. `jdbc:postgresql://localhost:5432/lastmile`).
- `DB_USER` / `DB_PASSWORD` — database credentials for the service. Use least-privilege accounts in production.

### Local config file (per-developer, not committed)

- Create `backend/services/user-service/src/main/resources/application-local.properties` from `application-local.properties.example` and set your local DB credentials and JWT secret.
- This file is intended for local development only and is ignored by git.

### Production configuration

- Do NOT store secrets in the repo. Use environment variables or a secrets manager (Kubernetes Secrets, HashiCorp Vault, AWS Secrets Manager, etc.).
- When running with `prod` profile, the application validates the JWT secret and will fail during startup if a weak/default secret is detected.

### Database preparation

- Run `backend/db/schema.sql` to create necessary tables before running the services.
- Optionally use `backend/db/create_roles.sql` to create per-developer DB roles.

### Protobuf generation

- The repo includes `backend/services/proto-common` which generates Java sources for all `.proto` files.
- If you change protos, regenerate there and install the module before building other services.

### Ports & resource limits

- All services have configurable `HTTP_PORT` and `GRPC_PORT` environment variables. Adjust these if running multiple services locally.
- Tune `DB_POOL_SIZE` for production based on your database connection limits.
