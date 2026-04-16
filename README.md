# DevOps Task Manager

A web-based task manager application built to demonstrate a complete DevOps lifecycle.

![Infrastructure Diagram](docs/infrastructure-diagram.png)

## Problem it solves
This project helps users create, view, update, and delete tasks through a web interface.

## Planned architecture
- Frontend: React
- Backend: Node.js + Express
- Database: PostgreSQL
- CI: GitHub Actions
- CD: Argo CD
- Orchestration: Kubernetes
- IaC: Terraform
- Observability: Prometheus + Loki + Grafana
- Alerts: Webhook notifications

## Project structure
- `app/frontend` - frontend application
- `app/backend` - backend API
- `k8s` - Kubernetes manifests
- `terraform` - infrastructure as code
- `.github/workflows` - CI/CD pipelines
- `docs` - diagrams and screenshots
- `monitoring` - monitoring and alerting configs

## Run instructions
Will be added as the project is implemented.

## Infrastructure as Code
Terraform is used to provision the base Kubernetes namespaces for:
- the application
- monitoring
- Argo CD

Example files are located in the `terraform/` directory.