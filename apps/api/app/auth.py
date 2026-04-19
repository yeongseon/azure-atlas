from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(key: str | None = Security(_api_key_header)) -> None:
    """Enforce API key auth for write endpoints.

    - If api_key is configured (non-empty): require matching key.
    - If api_key is empty (dev mode): allow all requests.
    """
    configured = settings.api_key
    if not configured:
        # Dev mode — no auth enforced
        return
    if not key or not key.strip():
        raise HTTPException(status_code=401, detail="Missing API key")
    if key.strip() != configured:
        raise HTTPException(status_code=401, detail="Invalid API key")
