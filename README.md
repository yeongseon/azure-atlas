# Azure Atlas

> Explore Azure as a knowledge map.

MS Learn Azure 공식 문서를 온톨로지 기반으로 재구성한 탐험형 지식 지도.
검색 결과 목록이 아니라 **개념 노드 + 관계 엣지 + 공식 근거**로 Azure를 탐험합니다.

## Stack

- **API**: Python 3.12 + FastAPI + asyncpg
- **DB**: PostgreSQL 16
- **Search**: PostgreSQL FTS (pg_trgm)
- **Frontend**: React 18 + Vite + TypeScript + Cytoscape.js + TanStack Query
- **Worker**: ARQ (async Redis Queue)
- **Cache**: Redis

## Structure

```
azure-atlas/
  apps/
    api/        # FastAPI backend
    web/        # React frontend
  packages/
    ontology/   # Seed data & schema definitions
```

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
