## Services overview

This project contains the following backend services (each is a Spring Boot + gRPC microservice):

- `user-service` (ports: HTTP 8081, gRPC 9091)
  - Responsibilities: user registration, authentication (username/password), JWT issuance, user profile retrieval.

- `driver-service` (ports: HTTP 8082, gRPC 9092)
  - Responsibilities: manage driver profiles, vehicles and capacity.

- `rider-service` (ports: HTTP 8083, gRPC 9093)
  - Responsibilities: rider-specific logic, manage rider intents (requests to join trips).

- `trip-service` (ports: HTTP 8084, gRPC 9094)
  - Responsibilities: trip scheduling, assignment of riders to trips, trip lifecycle.

- `station-service` (ports: HTTP 8085, gRPC 9095)
  - Responsibilities: station data and nearby places.

- `location-service` (ports: HTTP 8086, gRPC 9096)
  - Responsibilities: location updates for drivers and riders.

- `matching-service` (ports: HTTP 8087, gRPC 9097)
  - Responsibilities: in-memory matching engine that pairs rider intents with available trips/drivers and broadcasts match events.

- `notification-service` (ports: HTTP 8088, gRPC 9098)
  - Responsibilities: send notifications to users (email/push placeholder), store notification history.

Notes:
- Each service depends on generated gRPC classes from the shared `proto-common` module. Build `proto-common` first when protos change.
- Security: `user-service` issues JWTs; other services should use the same validation pattern via the shared `security-common` module.
