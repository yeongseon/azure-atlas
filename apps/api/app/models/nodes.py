from typing import Optional

from pydantic import BaseModel, ConfigDict


class NodePreview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    label: str
    node_type: str
    summary: Optional[str] = None


class GraphNodeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: str
    label: str
    node_type: str
    summary: Optional[str] = None
    evidence_count: int = 0


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
