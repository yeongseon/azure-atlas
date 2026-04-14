# API Reference

Azure Atlas provides a robust, RESTful API for querying the ontology, searching nodes, and managing the curation queue.

## Base URL

All API requests are made to the following base URL:

`/api/v1`

## Endpoints

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| `GET` | `/health` | Health check for the API service. | Public |
| `GET` | `/readyz` | Readiness check (validates DB + Redis). | Public |
| `GET` | `/version` | Returns current system version information. | Public |
| `GET` | `/meta` | Aggregate statistics for the ontology. | Public |
| `GET` | `/api/v1/domains` | List all available ontology domains. | Public |
| `GET` | `/api/v1/domains/{domain_id}` | Retrieve domain details and its subgraph. | Public |
| `GET` | `/api/v1/nodes/{node_id}` | Retrieve a specific node's metadata. | Public |
| `GET` | `/api/v1/nodes/{node_id}/subgraph` | Retrieve the subgraph centered on a node. | Public |
| `GET` | `/api/v1/nodes/{node_id}/evidence` | Retrieve documentation evidence for a node. | Public |
| `GET` | `/api/v1/search` | Full-text search across all nodes. | Public |
| `GET` | `/api/v1/journeys` | List all available learning journeys. | Public |
| `GET` | `/api/v1/journeys/{journey_id}` | Retrieve journey details and steps. | Public |
| `POST` | `/api/v1/events` | Track an analytics event. | API Key |
| `GET` | `/api/v1/curation/queue` | List pending curation items. | API Key |
| `PATCH` | `/api/v1/curation/queue/{item_id}` | Submit a curation decision. | API Key |

## Authentication

Write operations and sensitive endpoints require an API key for authentication. This key must be provided in the `X-API-Key` header of each request.

```http
GET /api/v1/curation/queue HTTP/1.1
X-API-Key: your_secret_api_key
```

## Interactive Documentation

Azure Atlas includes a built-in Swagger UI for interactive API exploration. You can access it at the following URL:

[http://localhost:8001/docs](http://localhost:8001/docs)

!!! tip "Query Parameters"
    The `/api/v1/nodes/{node_id}/subgraph` endpoint accepts `depth` and `relation_types` parameters to customize the scope of the returned graph.
