import json

from fastapi import APIRouter, Depends

from app.auth import require_api_key
from app.db import get_pool
from app.models.events import EventCreateRequest, EventCreateResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", dependencies=[Depends(require_api_key)])
async def create_event(body: EventCreateRequest) -> EventCreateResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        payload_json = json.dumps(body.payload) if body.payload else None
        event_id = await conn.fetchval(
            """
            INSERT INTO events (event_type, payload, session_id)
            VALUES ($1, $2::jsonb, $3)
            RETURNING event_id::text
            """,
            body.event_type,
            payload_json,
            body.session_id,
        )
    return EventCreateResponse(ok=True, event_id=event_id)
