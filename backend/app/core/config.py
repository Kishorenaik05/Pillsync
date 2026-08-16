from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "pillsync"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    
    SECRET_KEY: str = "a_very_secret_key_change_in_production_1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Gmail SMTP for email reminders
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""          # your Gmail address
    SMTP_PASSWORD: str = ""      # Gmail App Password (not your real password)
    EMAILS_FROM_NAME: str = "PillSync"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
