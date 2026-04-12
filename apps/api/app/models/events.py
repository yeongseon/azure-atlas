from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class EventCreateRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_type: str
    payload: Optional[dict[str, Any]] = None
    session_id: Optional[str] = None
