# Connect to Minikube Docker Env
# Note: You must run this in your PowerShell session manually first usually, 
# but we can try to invoke it here if minikube is in PATH.
# However, docker-env usually creates env vars for the current session.

Write-Host "Building Docker Images..."

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

Write-Host "Build Complete!"
