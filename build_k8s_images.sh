#!/bin/bash

# Ensure we are pointing to minikube docker daemon
eval $(minikube docker-env)

echo "Building Backend Services..."
# Build all backend microservices
docker build -t user-service:latest ./backend --build-arg SERVICE_NAME=user-service
docker build -t driver-service:latest ./backend --build-arg SERVICE_NAME=driver-service
docker build -t rider-service:latest ./backend --build-arg SERVICE_NAME=rider-service
docker build -t trip-service:latest ./backend --build-arg SERVICE_NAME=trip-service
docker build -t matching-service:latest ./backend --build-arg SERVICE_NAME=matching-service
docker build -t location-service:latest ./backend --build-arg SERVICE_NAME=location-service
docker build -t station-service:latest ./backend --build-arg SERVICE_NAME=station-service
docker build -t notification-service:latest ./backend --build-arg SERVICE_NAME=notification-service

echo "Building Frontend..."
docker build -t frontend-angular:latest ./frontend-angular

echo "All images built successfully in Minikube environment."
