# LastMile

LastMile is a microservices-based application for last-mile trip matching, connecting riders with drivers from metro stations to nearby locations. It uses a **Spring Boot** backend with **gRPC** microservices and an **Angular** frontend.

## Features

- **Microservices Architecture**: Built with Spring Boot and gRPC using a shared protobuf definition.
- **Real-time Matching**: Efficiently matches riders with drivers based on location, ETA, and intent.
- **JWT Authentication**: Secure, stateless authentication across all services.
- **Real-time Updates**: Live location tracking and status updates.
- **Infrastructure**: Containerized with Docker, orchestrated with Kubernetes (optional), and uses PostgreSQL and Redis.

## Architecture & Services

The backend consists of several independent microservices.

| Service | HTTP Port | gRPC Port | Responsibilities |
| :--- | :--- | :--- | :--- |
| **User Service** | 8081 | 9091 | User registration, authentication (JWT), profile management. |
| **Driver Service** | 8082 | 9092 | Driver profiles, vehicle management, route registration. |
| **Rider Service** | 8083 | 9093 | Rider specific logic, ride intent submission. |
| **Trip Service** | 8084 | 9094 | Trip lifecycle management, assignment of riders. |
| **Station Service** | 8085 | 9095 | Station metadata, nearby areas (graph). |
| **Location Service** | 8086 | 9096 | Real-time location tracking, driver telemetry. |
| **Matching Service** | 8087 | 9097 | Matches rider intents with available drivers. |
| **Notification Service** | 8088 | 9098 | Dispatching notifications (email/push/in-app). |

## Prerequisites

- **Java 17+** (e.g., Eclipse Temurin)
- **Maven 3.9+**
- **Node.js 18+ & npm** (for Frontend)
- **Docker Desktop** (for PostgreSQL, Redis, Envoy)
- **Kubernetes CLI (kubectl)** and **Minikube** (for K8s deployment)

## Configuration

### Environment Variables
Services are configured via `application.properties` but can be overridden with environment variables.

- `JWT_SECRET`: **Required**. Set a strong random secret (>=32 chars).
- `DB_URL`: JDBC URL (default: `jdbc:postgresql://localhost:5432/lastmile`)
- `DB_USER` / `DB_PASSWORD`: Database credentials (default: `postgres`/`postgres`).

**Setup for Local Development:**
1. Copy `backend/services/user-service/src/main/resources/application-local.properties.example` to `backend/services/user-service/src/main/resources/application-local.properties`.
2. Update `jwt.secret` and database credentials if necessary.

## Running Locally (Docker Compose)

This is the recommended way to run the full stack locally. It starts all backend services, databases, and the Envoy proxy (required for gRPC-Web).

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
    *Note: Ensure Docker Desktop is running.*

2.  **Verify Services**:
    Check that all containers are healthy. The backend services will be available on their respective ports, and the Envoy proxy will be on port `8080`.

## Running Locally (Service-by-Service)

Useful when you want to develop or debug a specific service while keeping others running in Docker or offline.

1.  **Start Infrastructure**:
    You need a running database and Redis. You can use Docker for this:
    ```bash
    docker run --name lastmile-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
    # (Optional) Load seed data if not using docker-compose
    # psql -h localhost -U postgres -d lastmile -f backend/db/schema.sql
    ```

2.  **Build Backend**:
    ```bash
    cd backend
    mvn clean install -DskipTests
    ```
    *This generates protobuf code and builds all jars.*

3.  **Run Individual Services**:
    Open separate terminals for each service you need to run. For example:

    **Terminal 1 (User Service):**
    ```bash
    cd backend/services/user-service
    mvn spring-boot:run -Dspring-boot.run.profiles=local
    ```

    **Terminal 2 (Driver Service):**
    ```bash
    cd backend/services/driver-service
    mvn spring-boot:run -Dspring-boot.run.profiles=local
    ```

    Repeat for other services as needed.

## Kubernetes Deployment (Minikube)

You can deploy the entire application to a local Kubernetes cluster using Minikube.

1.  **Start Minikube**:
    ```bash
    minikube start
    ```

2.  **Build Images in Minikube**:
    Use the provided script to build docker images directly inside Minikube's Docker daemon.
    ```bash
    ./build_k8s_images.sh
    ```

3.  **Deploy to Kubernetes**:
    Use the helper script to apply all manifests.
    ```bash
    ./run_kube.sh
    ```
    This script applies:
    - Infrastructure (DB, Redis)
    - Envoy Gateway (ConfigMap, Deployment, Service)
    - Backend Services (Deployments, Services)
    - Frontend (Deployment, Service)
    - HPA (Horizontal Pod Autoscalers)

4.  **Access the Application**:
    The `run_kube.sh` script sets up port forwarding for Envoy. You might need to manually forward ports if the script ends or if you want to access the frontend directly:
    ```bash
    kubectl port-forward svc/frontend-angular 80:80
    kubectl port-forward svc/envoy 8090:8090
    ```

## Running the Frontend

The frontend is an Angular application that communicates with backend services via **gRPC-Web** (proxied through Envoy).

1.  **Ensure Backend is Running**:
    Use Docker Compose, Kubernetes, or manual execution to ensure backend services and the Envoy proxy (port 8080 or 8090 depending on setup) are running.

2.  **Install Dependencies**:
    ```bash
    cd frontend-angular
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm start
    ```
    Access the app at `http://localhost:4200`.

**Note:** If you modify `.proto` files, you need to regenerate the Typescript definitions using the provided `gen-proto.sh` script in the `frontend-angular` directory.

## Troubleshooting

- **Protobuf Errors**: If you encounter missing classes, run `mvn clean install` in `backend` to regenerate sources.
- **Port Conflicts**: Ensure ports 8081-8088 and 9091-9098 are free before starting services manually.
- **Frontend Connection**: Ensure Envoy is running. Direct gRPC calls from browser are not supported; they must go through Envoy.
