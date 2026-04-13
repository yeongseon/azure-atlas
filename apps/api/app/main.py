import sys
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import db
from app.config import settings
from app.routers import curation, domains, events, journeys, nodes, search

API_V1_PREFIX = "/api/v1"

if settings.environment != "development" and not settings.api_key:
    sys.exit(
        "FATAL: API_KEY must be set when ENVIRONMENT != development. "
        "Set a non-empty API_KEY environment variable."
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.create_pool()
    yield
    await db.close_pool()


app = FastAPI(title="Azure Atlas API", version="0.1.0", lifespan=lifespan)

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
