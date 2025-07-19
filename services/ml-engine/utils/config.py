"""
Configuration settings for ML service
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # Service info
    SERVICE_NAME: str = "messai-ml-engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8001
    
    # Database
    DATABASE_URL: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://messai.ai",
        "https://*.messai.ai"
    ]
    
    # ML Model settings
    MODEL_CACHE_TTL: int = 3600  # 1 hour
    MAX_BATCH_SIZE: int = 100
    PREDICTION_TIMEOUT: int = 30  # seconds
    
    # Monitoring
    ENABLE_METRICS: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Materials Project API
    MATERIALS_PROJECT_API_KEY: str = ""
    MATERIALS_CACHE_TTL: int = 2592000  # 30 days in seconds
    
    class Config:
        env_file = ".env"
        env_prefix = "ML_"

settings = Settings()