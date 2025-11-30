# LastMile Application Usage Guide

This guide details how to build, run, and test the LastMile microservices application, including the full end-to-end flow with JWT authentication.

## Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Docker & Docker Compose**
- **grpcurl** (for testing gRPC endpoints)

## Building the Application

Build all services and the shared libraries:

```bash
cd backend
mvn clean install -DskipTests
```

## Running with Docker Compose

Start the entire stack (PostgreSQL, Redis, and all microservices):

```bash
docker-compose up --build
```

Ensure all services are up and healthy.

## Testing the End-to-End Flow

### 1. Create Users & Login (Get JWT)

**Create Rider:**
```bash
grpcurl -plaintext -d '{"name": "Rider One", "email": "rider@test.com", "password": "password", "role": "RIDER"}' localhost:9091 lastmile.user.UserService/CreateUser
```

**Login Rider:**
```bash
grpcurl -plaintext -d '{"email": "rider@test.com", "password": "password"}' localhost:9091 lastmile.user.UserService/Authenticate
```
*Copy the returned JWT token. Let's call it `RIDER_TOKEN`.*

**Create Driver:**
```bash
grpcurl -plaintext -d '{"name": "Driver One", "email": "driver@test.com", "password": "password", "role": "DRIVER"}' localhost:9091 lastmile.user.UserService/CreateUser
```

**Login Driver:**
```bash
grpcurl -plaintext -d '{"email": "driver@test.com", "password": "password"}' localhost:9091 lastmile.user.UserService/Authenticate
```
*Copy the returned JWT token. Let's call it `DRIVER_TOKEN`.*

### 2. Register Driver & Route

**Register Driver Profile:**
```bash
grpcurl -plaintext -H "Authorization: Bearer $DRIVER_TOKEN" -d '{"user_id": "driver-user-id", "vehicle_no": "KA01AB1234", "capacity": 4}' localhost:9192 lastmile.driver.DriverService/RegisterDriver
```
*Note: Use the `id` returned from CreateUser for `user_id`.*

**Register Route:**
```bash
grpcurl -plaintext -H "Authorization: Bearer $DRIVER_TOKEN" -d '{
  "driver_id": "DRIVER_ID_FROM_ABOVE",
  "stops": [
    {"sequence": 1, "area_id": "majestic", "arrival_offset_minutes": 0},
    {"sequence": 2, "area_id": "mg_road", "is_station": true, "arrival_offset_minutes": 10},
    {"sequence": 3, "area_id": "koramangala", "arrival_offset_minutes": 20}
  ]
}' localhost:9192 lastmile.driver.DriverService/RegisterRoute
```

### 3. Register Rider Intent

**Rider requests a ride:**
```bash
grpcurl -plaintext -H "Authorization: Bearer $RIDER_TOKEN" -d '{
  "user_id": "RIDER_ID_FROM_LOGIN",
  "station_area_id": "mg_road",
  "destination_area_id": "koramangala",
  "arrival_time": "2023-12-31T10:00:00Z"
}' localhost:9093 lastmile.rider.RiderService/RegisterRideIntent
```

### 4. Simulate Driver Location (Trigger Match)

**Send Telemetry to Location Service:**
```bash
grpcurl -plaintext -H "Authorization: Bearer $DRIVER_TOKEN" -d '{
  "driver_id": "DRIVER_ID",
  "route_id": "ROUTE_ID",
  "current_area_id": "majestic",
  "occupancy": 0
}' localhost:9094 lastmile.location.LocationService/StreamDriverTelemetry
```
*Note: This is a streaming call, you might need to keep the connection open or send one message. For simple testing, sending one message usually works if the server processes it immediately.*

### 5. Verify Match & Trip

Check `matching-service` logs or subscribe to matches:
```bash
grpcurl -plaintext -H "Authorization: Bearer $DRIVER_TOKEN" -d '{}' localhost:9097 lastmile.matching.MatchingService/SubscribeMatches
```

Check `trip-service` for created trip:
```bash
grpcurl -plaintext -H "Authorization: Bearer $DRIVER_TOKEN" -d '{"id": "TRIP_ID"}' localhost:9096 lastmile.trip.TripService/GetTrip
```

### 6. Verify Notifications

**Subscribe to Notifications (Rider/Driver):**
```bash
grpcurl -plaintext -H "Authorization: Bearer $RIDER_TOKEN" -d '{"user_id": "RIDER_ID"}' localhost:9098 lastmile.notification.NotificationService/Subscribe
```
*You should see a stream of notifications when a match is found or trip status changes.*

## Service Ports

- **Frontend**: 5173 (Dev) / 8080 (Envoy Proxy)
- **User Service**: 9091
- **Rider Service**: 9093
- **Driver Service**: 9192 (Host) / 9092 (Internal)
- **Location Service**: 9094
- **Station Service**: 9095
- **Trip Service**: 9096
- **Matching Service**: 9097
- **Notification Service**: 9098

## Running the Frontend

1.  **Start the Backend & Envoy**:
    ```bash
    docker-compose up --build
    ```
    *Ensure the `envoy` container is running and healthy.*

2.  **Start the Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Access the app at http://localhost:5173*

3.  **Usage**:
    -   **Login**: Use any email/password (e.g., `rider@test.com` / `password`). Select "Rider" or "Driver".
    -   **Rider**: Enter Station ID (e.g., `majestic`) and Destination ID (e.g., `koramangala`). Click "Request Ride".
    -   **Driver**: Click "Register Demo Route". Then "Start Simulation".
    -   **Notifications**: Watch the notification panel on both dashboards for updates.


