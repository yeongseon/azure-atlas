import sys
from collections.abc import AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

for _mod in ("asyncpg", "arq", "arq.connections", "redis", "redis.asyncio"):
    sys.modules.setdefault(_mod, MagicMock())


def _build_mock_pool(*, missing_rows: bool = False) -> MagicMock:
    mock_pool = MagicMock()
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.__aexit__ = AsyncMock(return_value=None)
    mock_pool.acquire.return_value = mock_conn

    mock_tx = MagicMock()
    mock_tx.__aenter__ = AsyncMock(return_value=None)
    mock_tx.__aexit__ = AsyncMock(return_value=None)
    mock_conn.transaction = MagicMock(return_value=mock_tx)

    async def fetch_side_effect(query: str, *args):
        if "FROM domains" in query and "ORDER BY display_order, label" in query:
            return [
                {
                    "domain_id": "network",
                    "label": "Network",
                    "description": "Networking services",
                    "icon_url": None,
                    "display_order": 1,
                }
            ]
        if "WHERE domain_id = $1 AND status = 'approved'" in query and "FROM nodes" in query:
            return [
                {
                    "node_id": "vnet",
                    "label": "Virtual Network",
                    "node_type": "service",
                    "summary": "Isolated Azure network",
                }
            ]
        if "FROM edges e" in query and "JOIN nodes src" in query:
            return [
                {
                    "edge_id": "edge-1",
                    "source_id": "vnet",
                    "target_id": "subnet",
                    "relation_type": "contains",
                    "weight": 1.0,
                }
            ]
        if "COUNT(ev.evidence_id)::int AS evidence_count" in query:
            return [{"node_id": "vnet", "evidence_count": 2}]
        if "ts_rank" in query:
            return [
                {
                    "node_id": "vnet",
                    "label": "Virtual Network",
                    "node_type": "service",
                    "summary": "Isolated Azure network",
                }
            ]
        if "SELECT DISTINCT" in query and "neighbor_id" in query:
            return [{"neighbor_id": "subnet"}]
        if "WHERE node_id = ANY($1::text[]) AND status = 'approved'" in query:
            return [
                {
                    "node_id": "vnet",
                    "label": "Virtual Network",
                    "node_type": "service",
                    "summary": "Isolated Azure network",
                    "evidence_count": 2,
                },
                {
                    "node_id": "subnet",
                    "label": "Subnet",
                    "node_type": "service",
                    "summary": "Segment of a VNet",
                    "evidence_count": 1,
                },
            ]
        if "FROM edges" in query and "WHERE source_id = ANY($1::text[])" in query:
            return [
                {
                    "edge_id": "edge-1",
                    "source_id": "vnet",
                    "target_id": "subnet",
                    "relation_type": "contains",
                    "weight": 1.0,
                }
            ]
        if "FROM evidence" in query and "WHERE node_id = $1" in query:
            return [
                {
                    "evidence_id": "evidence-1",
                    "node_id": args[0],
                    "excerpt": "Official Azure documentation excerpt",
                    "source_url": "https://learn.microsoft.com/example",
                    "source_title": "Azure docs",
                    "confidence_score": 0.99,
                }
            ]
        if "FROM journeys" in query and "ORDER BY title" in query:
            return [
                {
                    "journey_id": "journey-1",
                    "domain_id": "network",
                    "title": "Build a VNet",
                    "description": "Create a secure network",
                }
            ]
        if "FROM journey_steps js" in query:
            return [
                {
                    "step_order": 1,
                    "node_id": "vnet",
                    "label": "Virtual Network",
                    "narrative": "Start by creating a VNet",
                }
            ]
        return []

    async def fetchrow_side_effect(query: str, *args):
        if "schema_migrations" in query:
            return None
        if "FROM domains" in query and "WHERE domain_id = $1" in query:
            if missing_rows:
                return None
            return {
                "domain_id": args[0],
                "label": "Network",
                "description": "Networking services",
                "icon_url": None,
            }
        if "FROM nodes n" in query and "WHERE n.node_id = $1" in query:
            if missing_rows:
                return None
            return {
                "node_id": args[0],
                "domain_id": "network",
                "label": "Virtual Network",
                "node_type": "service",
                "summary": "Isolated Azure network",
                "detail_md": "Detailed docs",
            }
        if "FROM journeys" in query and "WHERE journey_id = $1" in query:
            if missing_rows:
                return None
            return {
                "journey_id": args[0],
                "domain_id": "network",
                "title": "Build a VNet",
                "description": "Create a secure network",
            }
        if "SELECT" in query and "domain_count" in query and "journey_count" in query:
            return {
                "domain_count": 1,
                "node_count": 2,
                "edge_count": 1,
                "evidence_count": 1,
                "journey_count": 1,
            }
        return None

    async def fetchval_side_effect(query: str, *args):
        if query == "SELECT 1":
            return 1
        if "SELECT 1 FROM nodes WHERE node_id = $1" in query:
            return None if missing_rows else 1
        if "SELECT filename FROM schema_migrations" in query:
            return "20260413_init.sql"
        if "INSERT INTO events" in query:
            return "event-1"
        if "UPDATE nodes SET status = $1" in query:
            return None if missing_rows else args[1]
        if "UPDATE edges SET status = $1" in query:
            return None if missing_rows else args[1]
        if "UPDATE evidence SET status = $1" in query:
            return None if missing_rows else args[1]
        return 1

    mock_conn.fetch = AsyncMock(side_effect=fetch_side_effect)
    mock_conn.fetchrow = AsyncMock(side_effect=fetchrow_side_effect)
    mock_conn.fetchval = AsyncMock(side_effect=fetchval_side_effect)
    return mock_pool


async def _make_client(mock_pool: MagicMock) -> AsyncIterator[AsyncClient]:
    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(return_value=True)
    mock_redis.aclose = AsyncMock()

    with (
        patch("app.db.create_pool", new_callable=AsyncMock),
        patch("app.db.close_pool", new_callable=AsyncMock),
        patch("app.db.get_pool", return_value=mock_pool),
        patch("app.routers.domains.get_pool", return_value=mock_pool),
        patch("app.routers.nodes.get_pool", return_value=mock_pool),
        patch("app.routers.search.get_pool", return_value=mock_pool),
        patch("app.routers.journeys.get_pool", return_value=mock_pool),
        patch("app.routers.events.get_pool", return_value=mock_pool),
        patch("app.routers.curation.get_pool", return_value=mock_pool),
        patch("app.main.aioredis") as mock_aioredis,
    ):
        mock_aioredis.from_url.return_value = mock_redis
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async for ac in _make_client(_build_mock_pool()):
        yield ac


@pytest.fixture
async def client_404() -> AsyncIterator[AsyncClient]:
    async for ac in _make_client(_build_mock_pool(missing_rows=True)):
        yield ac
