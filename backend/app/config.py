from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    ENV: str = "development"
    PORT: int = 8000

    DATABASE_URL: str

    GOOGLE_API_KEY: SecretStr
    GEMINI_MODEL_ID: str = "gemini-2.5-flash-lite"

    GEMINI_MAX_RPM: int = 15
    GEMINI_PEAK_TPM_INPUT: int = 3860

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()