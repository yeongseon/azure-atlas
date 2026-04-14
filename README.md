# Azure Atlas

![CI](https://github.com/yeongseon/azure-atlas/actions/workflows/ci.yml/badge.svg)

> Explore Azure as a knowledge map.

An ontology-based knowledge map of Azure, built on official MS Learn documentation. Explore Azure through **concept nodes + relationship edges + evidence links** instead of flat search results.

## Stack

- **API**: Python 3.12 + FastAPI + asyncpg
- **DB**: PostgreSQL 16
- **Search**: PostgreSQL FTS (pg_trgm)
- **Frontend**: React 18 + Vite + TypeScript + React Flow (@xyflow/react) + TanStack Query
- **Worker**: ARQ (async Redis Queue) — *stub, not yet wired*
- **Cache**: Redis — *used by ARQ; not required for core functionality*

## Structure

```
azure-atlas/
  apps/
    api/        # FastAPI backend
    web/        # React frontend
  packages/
    ontology/   # Seed data & schema definitions
```

## Architecture

The project follows a standard multi-tier architecture:

- **Frontend**: React SPA using React Flow for graph visualization.
- **API**: FastAPI providing RESTful endpoints.
- **Database**: PostgreSQL with FTS (pg_trgm) for full-text search and relational data.
- **Cache/Queue**: Redis + ARQ for background workers — *stub, not yet active*.

Data Flow: Browser (React SPA) → API (FastAPI) → Database (PostgreSQL)

## Quickstart

### Prerequisites

- [Podman](https://podman.io/) + [podman-compose](https://github.com/containers/podman-compose)
- [Node.js 20+](https://nodejs.org/) with [pnpm 9](https://pnpm.io/)
- [Python 3.12+](https://www.python.org/) (for bare-metal API development)

### One-command setup

```bash
make bootstrap
```

This copies `.env.example` → `.env`, builds all containers, starts the dev stack, and runs database migrations.

### Common commands

| Command | Description |
|---------|-------------|
| `make up-dev` | Start dev stack |
| `make down-dev` | Stop dev stack |
| `make logs-dev` | Tail dev logs |
| `make reset-db` | Drop DB, recreate, and re-seed |
| `make demo` | Start stack and print URLs |
| `make smoke` | Health-check running services |
| `make test-api` | Run API tests |
| `make test-web` | Typecheck + lint web app |
| `make lint` | Lint both API and web |
| `make help` | Show all Make targets |

### Workspace scripts

```bash
pnpm dev        # Start web dev server (bare-metal)
pnpm build      # Build web for production
pnpm lint       # Lint web app
pnpm typecheck  # Typecheck web app
```

### URLs

| Service | Dev | Prod |
|---------|-----|------|
| Web | http://localhost:5173 | http://localhost:8088 |
| API | http://localhost:8001 | http://localhost:8001 |
| API Docs | http://localhost:8001/docs | — |

## MVP Scope

- **Domains**:
  - **Network** (43 nodes) — VNet, Subnet, NSG, DNS, Load Balancer, Application Gateway, Front Door, Azure Firewall, VPN Gateway, ExpressRoute, Bastion, and more
  - **Storage** (46 nodes) — Storage Account, Blob, Files, Queue, Table, Data Lake Gen2, Managed Disks, Replication, Encryption, and more
  - **Compute** (48 nodes, VM-centric) — Virtual Machine, VMSS, Availability Sets/Zones, Trusted Launch, Disk Encryption, Autoscale, Backup, Site Recovery, and more
- **Views**: Concept Graph + Evidence Panel + Search
- **Journeys**: 25 curated scenarios across 3 domains

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started, our code style, and the development process.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for the full text.
