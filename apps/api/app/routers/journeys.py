from fastapi import APIRouter, HTTPException

from app.db import get_pool
from app.models.journeys import (
    JourneyDetailResponse,
    JourneyListResponse,
    JourneyPreview,
    JourneyStep,
)

router = APIRouter(prefix="/journeys", tags=["journeys"])


@router.get("")
async def list_journeys() -> JourneyListResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT journey_id, domain_id, title, description
            FROM journeys
            WHERE status = 'approved'
            ORDER BY title
            """
        )
    return JourneyListResponse(journeys=[JourneyPreview(**dict(row)) for row in rows])


@router.get("/{journey_id}")
async def get_journey(journey_id: str) -> JourneyDetailResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        journey = await conn.fetchrow(
            """
            SELECT journey_id, domain_id, title, description
            FROM journeys
            WHERE journey_id = $1 AND status = 'approved'
            """,
            journey_id,
        )
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")

        steps = await conn.fetch(
            """
            SELECT js.step_order, js.node_id, n.label, js.narrative
            FROM journey_steps js
            JOIN nodes n ON n.node_id = js.node_id AND n.status = 'approved'
            WHERE js.journey_id = $1
            ORDER BY js.step_order
            """,
            journey_id,
        )

    return JourneyDetailResponse(
        journey=JourneyPreview(**dict(journey)),
        steps=[JourneyStep(**dict(step)) for step in steps],
    )
