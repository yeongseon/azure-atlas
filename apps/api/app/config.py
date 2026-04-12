from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql://atlas:atlas@localhost:5432/atlas"
    redis_url: str = "redis://localhost:6379"
    log_level: str = "info"
    environment: str = "development"
    allowed_origins: str = "http://localhost:8080,http://localhost:5173"
    # A static token required for write operations (curation, events).
    # Empty string = no auth enforced (dev convenience default only).
    api_key: str = ""


settings = Settings()
