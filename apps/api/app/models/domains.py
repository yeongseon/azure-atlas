from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.nodes import GraphEdgeSummary, GraphNodeSummary, NodePreview


class DomainListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domains: list[dict]


class DomainOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domain_id: str
    label: str
    description: Optional[str] = None
    node_count: int = 0
    nodes: list[NodePreview] = []
    edges: list[GraphEdgeSummary] = []
    central_nodes: list[GraphNodeSummary] = []
