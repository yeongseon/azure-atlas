import sys
import time
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import db
from app.config import settings
from app.routers import curation, domains, events, graph, journeys, nodes, search

API_V1_PREFIX = "/api/v1"

try:
    settings.validate_production_settings()
except ValueError as exc:
    sys.exit(f"FATAL: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.create_pool()
    yield
    await db.close_pool()


app = FastAPI(title="Azure Atlas API", version="0.1.0", lifespan=lifespan)
_start_time = time.monotonic()

allowed_origins = (
    ["*"]
    if settings.environment == "development"
    else [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=settings.environment != "development",
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(domains.router, prefix=API_V1_PREFIX)
app.include_router(nodes.router, prefix=API_V1_PREFIX)
app.include_router(search.router, prefix=API_V1_PREFIX)
app.include_router(journeys.router, prefix=API_V1_PREFIX)
app.include_router(events.router, prefix=API_V1_PREFIX)
app.include_router(curation.router, prefix=API_V1_PREFIX)
app.include_router(graph.router, prefix=API_V1_PREFIX)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz() -> JSONResponse:
    checks: dict[str, str] = {}
    healthy = True

    # Check DB pool
    try:
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        checks["db"] = "ok"
    except Exception:
        checks["db"] = "unavailable"
        healthy = False

    # Check Redis
    try:
        r = aioredis.from_url(settings.redis_url)
        try:
            await r.ping()
            checks["redis"] = "ok"
        finally:
            await r.aclose()
    except Exception:
        checks["redis"] = "unavailable"
        healthy = False

    status_code = 200 if healthy else 503
    return JSONResponse(
        content={"status": "ready" if healthy else "unavailable", "checks": checks},
        status_code=status_code,
    )


@app.get("/version")
async def version() -> dict:
    import importlib.metadata

    try:
        pkg_version = importlib.metadata.version("azure-atlas-api")
    except importlib.metadata.PackageNotFoundError:
        pkg_version = app.version
    return {
        "version": pkg_version,
        "environment": settings.environment,
    }


@app.get("/meta")
async def meta() -> dict:
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        counts = await conn.fetchrow(
            """
            SELECT
                (SELECT count(*) FROM domains WHERE status='approved') AS domain_count,
                (SELECT count(*) FROM nodes WHERE status='approved') AS node_count,
                (SELECT count(*) FROM edges WHERE status='approved') AS edge_count,
                (SELECT count(*) FROM evidence WHERE status='approved') AS evidence_count,
                (SELECT count(*) FROM journeys WHERE status='approved') AS journey_count
            """
        )
        last_migration = await conn.fetchval(
            "SELECT filename FROM schema_migrations ORDER BY applied_at DESC LIMIT 1"
        )
    uptime_seconds = int(time.monotonic() - _start_time)
    return {
        "domain_count": counts["domain_count"],
        "node_count": counts["node_count"],
        "edge_count": counts["edge_count"],
        "evidence_count": counts["evidence_count"],
        "journey_count": counts["journey_count"],
        "last_migration": last_migration,
        "uptime_seconds": uptime_seconds,
    }
