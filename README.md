# LastMile

LastMile is a microservices-based application for last-mile trip matching, connecting riders with drivers from metro stations to nearby locations.

## Features

- **Microservices Architecture**: Built with Spring Boot and gRPC.
- **Real-time Matching**: Matches riders with drivers based on location and ETA.
- **JWT Authentication**: Secure access for all services.
- **Notifications**: Real-time updates for riders and drivers.
- **Infrastructure**: Dockerized services, PostgreSQL, Redis, and Kubernetes manifests.

## Getting Started

For detailed instructions on how to build, run, and test the application, please refer to [USAGE.md](USAGE.md).

## Quick Start

1.  **Build**:
    ```bash
    cd backend
    mvn clean install -DskipTests
    ```

2.  **Run**:
    ```bash
    docker-compose up --build
    ```

## Services

| Service | Port (HTTP) | Port (gRPC) | Description |
| :--- | :--- | :--- | :--- |
| **User Service** | 8081 | 9090 | Manages users and authentication |
| **Rider Service** | 8083 | 9091 | Manages rider intents |
| **Driver Service** | 8082 | 9092 | Manages drivers and routes |
| **Location Service** | 8086 | 9093 | Tracks driver location |
| **Station Service** | 8085 | 9095 | Manages station metadata |
| **Matching Service** | 8087 | 9097 | Matches riders to drivers |
| **Trip Service** | 8084 | 9098 | Manages active trips |
| **Notification Service** | 8088 | 9096 | Sends notifications |

## Technologies

- Java 17
- Spring Boot 3
- gRPC / Protobuf
- PostgreSQL
- Redis
- Docker / Kubernetes