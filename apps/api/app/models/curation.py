from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class CurationDecisionRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: Optional[str] = None
    edge_id: Optional[str] = None
    evidence_id: Optional[str] = None
    decision: Literal["approve", "reject", "needs_refresh"]
    reviewer_note: Optional[str] = None


class CurationDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ok: bool
