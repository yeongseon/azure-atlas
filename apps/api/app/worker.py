from arq.connections import RedisSettings

from app.config import settings
from app.pipeline.jobs import (
    chunk_document,
    extract_candidates,
    fetch_source,
    normalize_candidates,
    parse_source,
    publish_projection,
    score_candidates,
)


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    functions = [
        fetch_source,
        parse_source,
        chunk_document,
        extract_candidates,
        normalize_candidates,
        score_candidates,
        publish_projection,
    ]
