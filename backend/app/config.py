# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    borderconnect_api_key: str
    borderconnect_url: str
    groq_api_key: str
    
    class Config:
        env_file = ".env"
