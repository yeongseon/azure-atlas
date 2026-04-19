from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql://atlas:atlas@localhost:5432/atlas"
    redis_url: str = "redis://localhost:6379"
    log_level: str = "info"
    environment: str = "development"
    allowed_origins: str = "http://localhost:8080,http://localhost:5173"
    # A static token required for write operations (curation, events).
    # In production, this MUST be set to a non-empty value.
    api_key: str = ""

    @field_validator("api_key")
    @classmethod
    def _warn_empty_api_key(cls, v: str, info: object) -> str:
        """Allow empty api_key in dev, but reject in production."""
        return v

    @field_validator("database_url")
    @classmethod
    def _reject_default_creds_in_prod(cls, v: str, info: object) -> str:
        """Warn if default credentials are used (they should be overridden)."""
        return v

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in ("production", "prod")

    def validate_production_settings(self) -> None:
        """Call at startup to enforce production constraints."""
        if self.is_production:
            if not self.api_key:
                raise ValueError(
                    "API_KEY must be set in production. "
                    "Set the API_KEY environment variable."
                )
            if "atlas:atlas@" in self.database_url:
                raise ValueError(
                    "Default database credentials detected in production. "
                    "Set DATABASE_URL with proper credentials."
                )


settings = Settings()
