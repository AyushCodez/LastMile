# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY services/proto-common/pom.xml services/proto-common/
COPY services/user-service/pom.xml services/user-service/
COPY services/driver-service/pom.xml services/driver-service/
COPY services/rider-service/pom.xml services/rider-service/
COPY services/location-service/pom.xml services/location-service/
COPY services/station-service/pom.xml services/station-service/
COPY services/matching-service/pom.xml services/matching-service/
COPY services/trip-service/pom.xml services/trip-service/
COPY services/notification-service/pom.xml services/notification-service/
COPY services/security-common/pom.xml services/security-common/

# Download dependencies (cache layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY services services

# Build all modules
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
ARG SERVICE_NAME
WORKDIR /app
COPY --from=build /app/services/${SERVICE_NAME}/target/*-SNAPSHOT.jar app.jar

# Add curl for healthchecks (debian based)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
