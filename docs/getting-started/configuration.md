# Configuration

Azure Atlas uses environment variables for flexible configuration across development and production environments.

## API Environment Variables

The FastAPI backend is configured via a set of standard environment variables. You can find these in the `apps/api/.env` file.

| Variable | Default Value | Description |
| -------- | ------------- | ----------- |
| `DATABASE_URL` | `postgresql://atlas:atlas@localhost:5432/atlas` | Connection string for PostgreSQL database. |
| `REDIS_URL` | `redis://localhost:6379` | URL for the Redis server used by the ARQ worker. |
| `LOG_LEVEL` | `info` | Logging verbosity (debug, info, warning, error). |
| `ENVIRONMENT` | `development` | The environment the application is running in. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | List of origins allowed for CORS. |
| `API_KEY` | *(None)* | Secret key required for write endpoints. |

!!! danger "Production Security"
    In non-development environments, the `API_KEY` is mandatory. The application will fail to start if this variable is missing to prevent unauthorized write access to the ontology.

## Web Environment Variables

The React frontend configuration is located in the `apps/web/.env` file.

| Variable | Description |
| -------- | ----------- |
| `VITE_API_URL` | The base URL for the FastAPI backend. Default: `http://localhost:8000/api/v1` |

## Docker Compose Configuration

Azure Atlas uses different Docker Compose files for development and production environments.

-   **Base:** `docker-compose.yml` — shared service definitions (db, redis, api, web).
-   **Development:** `docker-compose.dev.yml` — used by `make up-dev`. Mounts local directories for live-reloading.
-   **Production:** `docker-compose.prod.yml` — builds immutable images with optimized settings and nginx reverse proxy.

!!! tip "Container Runtime"
    Azure Atlas uses Podman as the container runtime. All `make` targets invoke `podman-compose` instead of `docker-compose`.
