from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.nodes import GraphEdgeSummary, GraphNodeSummary


class DomainSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domain_id: str
    label: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    display_order: Optional[int] = None


class DomainListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domains: list[DomainSummary]


class DomainDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domain: DomainSummary
    nodes: list[GraphNodeSummary]
    edges: list[GraphEdgeSummary]
    node_count: int
