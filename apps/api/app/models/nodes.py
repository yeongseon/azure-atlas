from typing import Optional

from pydantic import BaseModel, ConfigDict


class NodePreview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    label: str
    node_type: str
    summary: Optional[str] = None


class NodeDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    domain_id: str
    label: str
    node_type: str
    summary: Optional[str] = None
    detail_md: Optional[str] = None
    semantic_layer: Optional[str] = None
    view_hints: Optional[dict] = None

class NodeDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node: NodeDetail


class GraphNodeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    label: str
    node_type: str
    summary: Optional[str] = None
    evidence_count: int = 0
    semantic_layer: Optional[str] = None


class GraphEdgeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    edge_id: str
    source_id: str
    target_id: str
    relation_type: str
    weight: float = 1.0


class EvidenceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    evidence_id: str
    node_id: str
    excerpt: str
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    confidence_score: Optional[float] = None


class SubgraphResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    center_node_id: str
    nodes: list[GraphNodeSummary]
    edges: list[GraphEdgeSummary]


class NodeEvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    evidence: list[EvidenceSummary]
