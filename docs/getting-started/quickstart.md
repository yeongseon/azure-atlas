# Quickstart

Get Azure Atlas up and running on your local machine with a single command.

## One-Command Setup

Azure Atlas provides a bootstrap script to automate environment setup, container orchestration, and database seeding.

```bash
make bootstrap
```

This command performs the following actions:
1. Validates local prerequisites (Podman, Node.js, Python).
2. Generates necessary `.env` files from templates.
3. Builds and starts containers (PostgreSQL, Redis, API, Web).
4. Runs database migrations and applies the ontology seed data.

## Accessing the Application

Once the bootstrap process completes, you can access the various components of the system:

| Component | Environment | URL |
| --------- | ----------- | --- |
| **Web Frontend** | Development | [http://localhost:5173](http://localhost:5173) |
| **API Backend** | Development | [http://localhost:8001/api/v1](http://localhost:8001/api/v1) |
| **Interactive API Docs** | Development | [http://localhost:8001/docs](http://localhost:8001/docs) |

## Common Commands

Manage your development environment using these `make` commands:

| Command | Description |
| ------- | ----------- |
| `make up-dev` | Start all dev services in the background. |
| `make down-dev` | Stop and remove all dev containers. |
| `make logs-dev` | Stream logs from all running dev services. |
| `make reset-db` | Wipe the database and re-apply seeds. |
| `make test-api` | Run the API test suite. |
| `make test-web` | Typecheck and lint the web app. |
| `make lint` | Lint both API and web. |

!!! tip
    If you encounter issues during the initial build, try `make down-dev` followed by `make bootstrap` to ensure a clean slate.

!!! warning "Hardware Resources"
    Running the full stack via Podman requires at least 4GB of RAM allocated to your container runtime.
