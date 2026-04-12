from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.routers import curation, domains, events, journeys, nodes, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.create_pool()
    yield
    await db.close_pool()


app = FastAPI(title="Azure Atlas API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(domains.router)
app.include_router(nodes.router)
app.include_router(search.router)
app.include_router(journeys.router)
app.include_router(events.router)
app.include_router(curation.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
