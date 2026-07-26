# k8s-demo-api — Docker + Kubernetes (kind) + Helm

A minimal REST API, containerized with Docker and deployed onto a real
local Kubernetes cluster via `kind`, packaged and managed with a Helm
chart. Demonstrates container orchestration end-to-end, entirely on
free, open-source tooling — no cloud account, no card, no cost.

## Why this exists

Container orchestration (Kubernetes, Helm) is a core requirement for
cloud infrastructure roles. This repo proves the skill hands-on:
building an image, running it as multiple replicas on a real cluster,
health-checked and load-balanced by Kubernetes itself.

## Stack

- **Node.js / Express** — the demo API itself (kept intentionally
  simple so the repo's focus stays on the orchestration layer)
- **Docker** — containerizes the app
- **[kind](https://kind.sigs.k8s.io/)** — runs a real local Kubernetes
  cluster inside Docker, free and open-source
- **Helm** — templated, versioned Kubernetes deployment
- **GitHub Actions** — builds the image and lints the Helm chart on
  every PR

## Architecture

```
   Docker image (k8s-demo-api)
            |
     kind cluster (local K8s)
            |
   Deployment (2 replicas) ---- readiness/liveness probes on /health
            |
    Service (NodePort 30080) ---- reachable at localhost:30080
```

## Running it locally

```bash
# 1. Create the local Kubernetes cluster
kind create cluster --name k8s-demo --config kind-config.yaml

# 2. Build the Docker image
docker build -t k8s-demo-api:local ./app

# 3. Load the image into the kind cluster
#    (kind runs its own Docker-in-Docker nodes, so images built
#    locally aren't visible to it until explicitly loaded)
kind load docker-image k8s-demo-api:local --name k8s-demo

# 4. Deploy with Helm
helm install demo ./helm/k8s-demo-api

# 5. Check the pods are running
kubectl get pods
kubectl get svc

# 6. Hit the API
curl http://localhost:30080/health
curl -X POST http://localhost:30080/notes -H "Content-Type: application/json" -d '{"text":"first note"}'
curl http://localhost:30080/notes

# 7. Tear down
helm uninstall demo
kind delete cluster --name k8s-demo
```

## What this demonstrates

- Writing a production-shaped Dockerfile (small base image, no dev deps)
- Kubernetes fundamentals: Deployments, Services, replica counts,
  readiness/liveness probes
- Helm chart authoring: templated manifests, `values.yaml` for config
- CI that builds the image and lints the chart on every PR
