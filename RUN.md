# LastMile – Local Run & Smoke Test Guide

This checklist walks you through standing up the full LastMile stack locally, seeding the shared data, launching each gRPC microservice, and issuing a few quick sanity calls. All commands below assume the repo root (`LastMile/`). Paths use PowerShell style since the dev environment is Windows.

---

## 1. Prerequisites

- Java 17 (e.g., Temurin 17)
- Maven 3.9+
- Docker Desktop (for a disposable PostgreSQL instance)
- Optional: [`grpcurl`](https://github.com/fullstorydev/grpcurl/releases) for manual gRPC testing

```powershell
java -version
mvn -version
docker --version
```

---

## 2. Start PostgreSQL (container)

> Feel free to point the services at an existing Postgres instance instead. The default JDBC URL is `jdbc:postgresql://localhost:5432/lastmile` with user/password `postgres/postgres`.

```powershell
# Run from repo root
$env:POSTGRES_PASSWORD = "postgres"
docker run --name lastmile-db `
  -e POSTGRES_DB=lastmile `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=$env:POSTGRES_PASSWORD `
  -p 5432:5432 `
  -d postgres:15
```

Wait until the container reports `database system is ready to accept connections` (check with `docker logs -f lastmile-db`).

---

## 3. Load the master schema & seed data

```powershell
# Still in repo root
Get-Content backend/db/schema.sql | psql "host=localhost port=5432 dbname=lastmile user=postgres password=$env:POSTGRES_PASSWORD"
```

Each service also ships a `schema.sql` that Spring runs on startup to ensure tables exist, but the master schema above loads the Bangalore area graph and canonical sample data once.

---

## 4. Build everything

```powershell
cd backend
mvn clean install
```

This generates the protobuf code, compiles all services, and runs their unit tests. On subsequent iterations you can use `mvn verify` or `mvn -pl <module> spring-boot:run` to rebuild selectively.

---

## 5. Run the microservices (each in its own terminal)

Open a PowerShell session per service and run:

```powershell
# Station service (ports: HTTP 8085, gRPC 9095)
cd backend/services/station-service
mvn spring-boot:run

# Driver service (HTTP 8082, gRPC 9092)
cd backend/services/driver-service
mvn spring-boot:run

# Rider service (HTTP 8083, gRPC 9093)
cd backend/services/rider-service
mvn spring-boot:run

# Trip service (HTTP 8084, gRPC 9094)
cd backend/services/trip-service
mvn spring-boot:run

# Matching service (HTTP 8087, gRPC 9097)
cd backend/services/matching-service
mvn spring-boot:run

# Location service (HTTP 8086, gRPC 9096)
cd backend/services/location-service
mvn spring-boot:run

# Notification service (HTTP 8088, gRPC 9098) – optional placeholder
cd backend/services/notification-service
mvn spring-boot:run

# User service (HTTP 8081, gRPC 9091) – optional example
cd backend/services/user-service
mvn spring-boot:run
```

> Tip: if a port is busy, set `HTTP_PORT` / `GRPC_PORT` environment variables before launching, e.g. `setx HTTP_PORT 8181` (Windows) or `$env:HTTP_PORT=8181` (PowerShell session only).

Services that depend on others (e.g., Location → Driver/Matching) will retry connections on startup; keep an eye on the logs for confirmation.

---

## 6. Quick sanity checks with grpcurl

Run these in a new terminal once the services are up.

```powershell
# List all areas via station-service
grpcurl -plaintext localhost:9095 lastmile.station.StationService/ListAreas

# Register a driver and route
$driverPayload = @'
{
  "userId": "user-demo",
  "vehicleNo": "KA-09-AB-1234",
  "capacity": 4
}
'@
grpcurl -plaintext -d $driverPayload localhost:9092 lastmile.driver.DriverService/RegisterDriver

$routePayload = @'
{
  "driverId": "<driver-id-from-previous-response>",
  "stops": [
    {"sequence": 0, "areaId": "area_majestic", "isStation": true,  "arrivalOffsetMinutes": 0},
    {"sequence": 1, "areaId": "area_mg_road", "isStation": false, "arrivalOffsetMinutes": 12},
    {"sequence": 2, "areaId": "area_indiranagar", "isStation": true,  "arrivalOffsetMinutes": 22}
  ]
}
'@
grpcurl -plaintext -d $routePayload localhost:9092 lastmile.driver.DriverService/RegisterRoute

# Submit a rider intent
$riderPayload = @'
{
  "userId": "rider-demo",
  "stationAreaId": "area_indiranagar",
  "destinationAreaId": "area_whitefield",
  "arrivalTime": {"seconds": [math]::Floor((Get-Date).AddMinutes(5).ToUniversalTime().Subtract([datetime]'1970-01-01').TotalSeconds)},
  "partySize": 1
}
'@
grpcurl -plaintext -d $riderPayload localhost:9093 lastmile.rider.RiderService/RegisterRideIntent
```

You should see successful responses (intent IDs, driver IDs, etc.). Monitor the matching-service logs to confirm match attempts when telemetry events are emitted (see next step).

---

## 7. Simulate driver telemetry (Location → Matching)

```powershell
$telemetryPayload = @'
{
  "driverId": "<driver-id>",
  "routeId": "<route-id>",
  "currentAreaId": "area_indiranagar",
  "etaToStationMinutes": 5,
  "seatsAvailable": 3,
  "destinationAreaId": "area_whitefield"
}
'@
grpcurl -plaintext -d $telemetryPayload localhost:9096 lastmile.location.LocationService/PushTelemetry
```

Location service will cache route metadata from driver-service, compute ETAs, and call matching-service. Expect matching-service logs announcing a synthetic match (it seeds demo riders when queues are empty).

---

## 8. Shut down & cleanup

Stop each `mvn spring-boot:run` session with `Ctrl+C`, then remove the Postgres container:

```powershell
docker stop lastmile-db
docker rm lastmile-db
```

---

## Troubleshooting

- **Protobuf rebuilds** – If interfaces change, rerun `mvn -pl services/proto-common clean install` before rebuilding other modules.
- **Database conflicts** – Drop the `lastmile` database or restart the container if schema drift occurs; services expect the seed data to exist.
- **Port in use** – Override `HTTP_PORT`/`GRPC_PORT` per service or free the port with `Get-Process -Id (Get-NetTCPConnection -LocalPort 9092).OwningProcess`.

Happy testing! 🎯
