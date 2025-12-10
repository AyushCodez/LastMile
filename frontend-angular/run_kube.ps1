Write-Host "Deploying to Kubernetes..."

# Infrastructure (DB, Redis)
kubectl apply -f k8s/infra.yaml

# Envoy Gateway (Config + App)
kubectl apply -f k8s/envoy-config.yaml
kubectl apply -f k8s/envoy-deployment.yaml

# Backend Services
kubectl apply -f k8s/backend-services.yaml

# Frontend
kubectl apply -f k8s/frontend.yaml

Write-Host "Deployment Applied!"
