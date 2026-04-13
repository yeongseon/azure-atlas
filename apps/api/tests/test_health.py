import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
async def client():
    mock_pool = MagicMock()
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.__aexit__ = AsyncMock(return_value=None)
    mock_pool.acquire.return_value = mock_conn
    mock_conn.fetch = AsyncMock(return_value=[])
    mock_conn.fetchval = AsyncMock(return_value=1)

    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(return_value=True)
    mock_redis.aclose = AsyncMock()

    with (
        patch("app.db.create_pool", new_callable=AsyncMock),
        patch("app.db.close_pool", new_callable=AsyncMock),
        patch("app.db.get_pool", return_value=mock_pool),
        patch("app.main.aioredis") as mock_aioredis,
    ):
        mock_aioredis.from_url.return_value = mock_redis
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.mark.anyio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.anyio
async def test_api_v1_prefix_domains(client):
    response = await client.get("/api/v1/domains")
    assert response.status_code == 200
    assert "domains" in response.json()


@pytest.mark.anyio
async def test_api_v1_prefix_search(client):
    response = await client.get("/api/v1/search?q=vnet")
    assert response.status_code == 200
    assert "results" in response.json()


@pytest.mark.anyio
async def test_api_v1_prefix_journeys(client):
    response = await client.get("/api/v1/journeys")
    assert response.status_code == 200
    assert "journeys" in response.json()


@pytest.mark.anyio
async def test_readyz_healthy(client):
    response = await client.get("/readyz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["checks"]["db"] == "ok"
    assert body["checks"]["redis"] == "ok"


@pytest.mark.anyio
async def test_readyz_db_down():
    mock_redis = AsyncMock()
    mock_redis.ping = AsyncMock(return_value=True)
    mock_redis.aclose = AsyncMock()

    with (
        patch("app.db.create_pool", new_callable=AsyncMock),
        patch("app.db.close_pool", new_callable=AsyncMock),
        patch("app.db.get_pool", side_effect=RuntimeError("pool gone")),
        patch("app.main.aioredis") as mock_aioredis,
    ):
        mock_aioredis.from_url.return_value = mock_redis
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/readyz")
            assert response.status_code == 503
            body = response.json()
            assert body["checks"]["db"] == "unavailable"
            assert body["checks"]["redis"] == "ok"
