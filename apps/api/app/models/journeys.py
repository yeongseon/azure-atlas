from typing import Optional

from pydantic import BaseModel, ConfigDict


class JourneyStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_order: int
    node_id: str
    label: str
    narrative: Optional[str] = None


class JourneyDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    journey_id: str
    title: str
    description: Optional[str] = None
    domain_id: Optional[str] = None
    steps: list[JourneyStep] = []
