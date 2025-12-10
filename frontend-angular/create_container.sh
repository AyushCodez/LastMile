# Backend Services
docker build -t user-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=user-service backend
docker build -t rider-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=rider-service backend
docker build -t driver-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=driver-service backend
docker build -t location-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=location-service backend
docker build -t station-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=station-service backend
docker build -t trip-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=trip-service backend
docker build -t matching-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=matching-service backend
docker build -t notification-service:latest -f backend/Dockerfile --build-arg SERVICE_NAME=notification-service backend

# Frontend
docker build -t frontend-angular:latest -f frontend-angular/Dockerfile frontend-angular