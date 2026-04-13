from unittest.mock import patch

import pytest

from app.config import settings


@pytest.mark.anyio
async def test_events_requires_auth(client):
    body = {"event_type": "page_view", "payload": {"page": "/test"}}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post("/api/v1/events", json=body)

    assert response.status_code == 401


@pytest.mark.anyio
async def test_events_with_valid_key(client):
    body = {"event_type": "page_view", "payload": {"page": "/test"}}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post(
            "/api/v1/events",
            json=body,
            headers={"X-API-Key": "test-key"},
        )

    assert response.status_code == 200
    assert response.json() == {"ok": True, "event_id": "event-1"}


@pytest.mark.anyio
async def test_events_no_auth_in_dev(client):
    body = {"event_type": "page_view", "payload": {"page": "/test"}}

    with patch.object(settings, "api_key", ""):
        response = await client.post("/api/v1/events", json=body)

    assert response.status_code == 200
    assert response.json()["ok"] is True


@pytest.mark.anyio
async def test_curation_requires_auth(client):
    body = {"node_id": "test-node", "decision": "approve"}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post("/api/v1/curation/decisions", json=body)

    assert response.status_code == 401


@pytest.mark.anyio
async def test_curation_with_valid_key(client):
    body = {"node_id": "test-node", "decision": "approve"}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post(
            "/api/v1/curation/decisions",
            json=body,
            headers={"X-API-Key": "test-key"},
        )

    assert response.status_code == 202
    assert response.json() == {"ok": True}
