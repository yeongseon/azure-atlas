from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_api_key
from app.db import get_pool
from app.models.curation import CurationDecisionRequest, CurationDecisionResponse

router = APIRouter(prefix="/curation", tags=["curation"])

_STATUS_MAP = {
    "approve": "approved",
    "reject": "rejected",
    "needs_refresh": "needs_refresh",
}


@router.post("/decisions", status_code=202, dependencies=[Depends(require_api_key)])
async def create_decision(body: CurationDecisionRequest) -> CurationDecisionResponse:
    if not any([body.node_id, body.edge_id, body.evidence_id]):
        raise HTTPException(
            status_code=422, detail="One of node_id, edge_id, or evidence_id is required"
        )

    new_status = _STATUS_MAP[body.decision]
    pool = await get_pool()

    async with pool.acquire() as conn:
        async with conn.transaction():
            if body.node_id:
                updated = await conn.fetchval(
                    "UPDATE nodes SET status = $1, updated_at = now()"
                    " WHERE node_id = $2 RETURNING node_id",
                    new_status,
                    body.node_id,
                )
                if not updated:
                    raise HTTPException(status_code=404, detail="Node not found")

            if body.edge_id:
                updated = await conn.fetchval(
                    "UPDATE edges SET status = $1 WHERE edge_id = $2::uuid RETURNING edge_id::text",
                    new_status,
                    body.edge_id,
                )
                if not updated:
                    raise HTTPException(status_code=404, detail="Edge not found")

            if body.evidence_id:
                updated = await conn.fetchval(
                    "UPDATE evidence SET status = $1, updated_at = now()"
                    " WHERE evidence_id = $2::uuid RETURNING evidence_id::text",
                    new_status,
                    body.evidence_id,
                )
                if not updated:
                    raise HTTPException(status_code=404, detail="Evidence not found")

    return CurationDecisionResponse(ok=True)
