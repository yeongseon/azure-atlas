import pytest


@pytest.mark.anyio
async def test_version(client):
    response = await client.get("/version")

    assert response.status_code == 200
    body = response.json()
    assert "version" in body
    assert "environment" in body


@pytest.mark.anyio
async def test_meta(client):
    response = await client.get("/meta")

    assert response.status_code == 200
    body = response.json()
    assert body["domain_count"] == 1
    assert body["node_count"] == 2
    assert "uptime_seconds" in body


@pytest.mark.anyio
async def test_get_graph(client):
    response = await client.get("/api/v1/graph")

    assert response.status_code == 200
    body = response.json()
    assert body["domain_count"] == 2
    assert body["node_count"] == 2
    assert len(body["nodes"]) == 2
    domain_ids = {n["domain_id"] for n in body["nodes"]}
    assert "network" in domain_ids
    assert "compute" in domain_ids
    cross_edges = [
        e for e in body["edges"] if e["source_id"] == "vnet" and e["target_id"] == "vm-1"
    ]
    assert len(cross_edges) == 1


@pytest.mark.anyio
async def test_get_domain(client):
    response = await client.get("/api/v1/domains/network")

    assert response.status_code == 200
    body = response.json()
    assert body["domain"]["domain_id"] == "network"
    assert body["node_count"] == 1
    assert len(body["nodes"]) == 1


@pytest.mark.anyio
async def test_get_domain_not_found(client_404):
    response = await client_404.get("/api/v1/domains/nonexistent")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_get_node(client):
    response = await client.get("/api/v1/nodes/vnet")

    assert response.status_code == 200
    body = response.json()
    assert body["node"]["node_id"] == "vnet"
    assert body["node"]["domain_id"] == "network"


@pytest.mark.anyio
async def test_get_node_not_found(client_404):
    response = await client_404.get("/api/v1/nodes/nonexistent")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_get_node_subgraph(client):
    response = await client.get("/api/v1/nodes/vnet/subgraph")

    assert response.status_code == 200
    body = response.json()
    assert body["center_node_id"] == "vnet"
    assert len(body["nodes"]) >= 1
    assert len(body["edges"]) == 1


@pytest.mark.anyio
async def test_get_node_evidence(client):
    response = await client.get("/api/v1/nodes/vnet/evidence")

    assert response.status_code == 200
    body = response.json()
    assert body["node_id"] == "vnet"
    assert len(body["evidence"]) == 1


@pytest.mark.anyio
async def test_search_empty_query(client):
    response = await client.get("/api/v1/search", params={"q": ""})

    assert response.status_code == 422


@pytest.mark.anyio
async def test_get_journey(client):
    response = await client.get("/api/v1/journeys/journey-1")

    assert response.status_code == 200
    body = response.json()
    assert body["journey"]["journey_id"] == "journey-1"
    assert len(body["steps"]) == 1


@pytest.mark.anyio
async def test_get_journey_not_found(client_404):
    response = await client_404.get("/api/v1/journeys/nonexistent")

    assert response.status_code == 404
