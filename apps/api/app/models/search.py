from pydantic import BaseModel, ConfigDict

from app.models.nodes import NodePreview


class SearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: str
    results: list[NodePreview] = []
    total: int = 0
