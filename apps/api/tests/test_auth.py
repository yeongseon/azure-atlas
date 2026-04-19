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


@pytest.mark.anyio
async def test_events_rejects_whitespace_key(client):
    """A key that is only whitespace should be rejected."""
    body = {"event_type": "page_view", "payload": {"page": "/test"}}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post(
            "/api/v1/events",
            json=body,
            headers={"X-API-Key": "   "},
        )

    assert response.status_code == 401


@pytest.mark.anyio
async def test_events_rejects_wrong_key(client):
    """A wrong key should be rejected with 401."""
    body = {"event_type": "page_view", "payload": {"page": "/test"}}

    with patch.object(settings, "api_key", "test-key"):
        response = await client.post(
            "/api/v1/events",
            json=body,
            headers={"X-API-Key": "wrong-key"},
        )

    assert response.status_code == 401


def test_validate_production_settings_rejects_empty_key():
    """Production must have API_KEY set."""
    with patch.object(settings, "api_key", ""):
        with patch.object(settings, "environment", "production"):
            with pytest.raises(ValueError, match="API_KEY must be set"):
                settings.validate_production_settings()


def test_validate_production_settings_rejects_default_creds():
    """Production must not use default database credentials."""
    with patch.object(settings, "api_key", "real-key"):
        with patch.object(settings, "environment", "production"):
            with patch.object(
                settings,
                "database_url",
                "postgresql://atlas:atlas@localhost:5432/atlas",
            ):
                with pytest.raises(ValueError, match="Default database credentials"):
                    settings.validate_production_settings()


def test_validate_production_settings_ok_in_dev():
    """Dev mode should not raise even with defaults."""
    with patch.object(settings, "api_key", ""):
        with patch.object(settings, "environment", "development"):
            settings.validate_production_settings()  # Should not raise
