import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
async def client():
    from unittest.mock import AsyncMock, patch

    with (
        patch("app.db.create_pool", new_callable=AsyncMock),
        patch("app.db.close_pool", new_callable=AsyncMock),
    ):
        from app.main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
