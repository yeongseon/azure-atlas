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

## MVP Scope

- **Domains**:
  - **Network** (43 nodes) — VNet, Subnet, NSG, DNS, Load Balancer, Application Gateway, Front Door, Azure Firewall, VPN Gateway, ExpressRoute, Bastion, and more
  - **Storage** (46 nodes) — Storage Account, Blob, Files, Queue, Table, Data Lake Gen2, Managed Disks, Replication, Encryption, and more
  - **Compute** (48 nodes, VM-centric) — Virtual Machine, VMSS, Availability Sets/Zones, Trusted Launch, Disk Encryption, Autoscale, Backup, Site Recovery, and more
- **Views**: Concept Graph + Evidence Panel + Search
- **Journeys**: 25 curated scenarios across 3 domains
