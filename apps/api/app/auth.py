from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(key: str | None = Security(_api_key_header)) -> None:
    configured = settings.api_key
    if configured and key != configured:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
