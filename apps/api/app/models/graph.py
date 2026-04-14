from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.nodes import GraphEdgeSummary


class UnifiedGraphNode(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    domain_id: str
    label: str
    node_type: str
    summary: Optional[str] = None
    evidence_count: int = 0


class UnifiedGraphResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nodes: list[UnifiedGraphNode]
    edges: list[GraphEdgeSummary]
    domain_count: int
    node_count: int
