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

- **Domain**: Network (VNet, Subnet, NSG, DNS, Public IP, Private Endpoint, Route Table, Private DNS)
- **Views**: Concept Graph + Evidence Panel + Search
- **Journeys**: 5–7 curated scenarios
