# Infrastructure (DB, Redis)
kubectl apply -f k8s/infra.yaml

# Envoy Gateway (Config + App)
kubectl apply -f k8s/envoy-config.yaml
kubectl apply -f k8s/envoy-deployment.yaml

# Backend Services
kubectl apply -f k8s/backend-services.yaml

# Frontend
kubectl apply -f k8s/frontend.yaml

kubectl apply -f k8s/hpa.yaml

kubectl port-forward svc/envoy 8090:8090