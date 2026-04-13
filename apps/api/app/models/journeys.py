from typing import Optional

from pydantic import BaseModel, ConfigDict


class JourneyStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_order: int
    node_id: str
    label: str
    narrative: Optional[str] = None


class JourneyPreview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    journey_id: str
    domain_id: Optional[str] = None
    title: str
    description: Optional[str] = None


class JourneyListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    journeys: list[JourneyPreview]


class JourneyDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    journey: JourneyPreview
    steps: list[JourneyStep]
