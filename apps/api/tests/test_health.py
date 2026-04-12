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

    with (
        patch("app.db.create_pool", new_callable=AsyncMock),
        patch("app.db.close_pool", new_callable=AsyncMock),
        patch("app.db.get_pool", return_value=mock_pool),
    ):
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_api_v1_prefix_domains(client):
    response = await client.get("/api/v1/domains")
    assert response.status_code == 200
    assert "domains" in response.json()


@pytest.mark.asyncio
async def test_api_v1_prefix_search(client):
    response = await client.get("/api/v1/search?q=vnet")
    assert response.status_code == 200
    assert "results" in response.json()


@pytest.mark.asyncio
async def test_api_v1_prefix_journeys(client):
    response = await client.get("/api/v1/journeys")
    assert response.status_code == 200
    assert "journeys" in response.json()
