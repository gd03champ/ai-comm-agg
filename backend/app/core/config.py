import os
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Commerce Aggregator API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    
    # CORS configuration
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # Modify in production
    
    # E-commerce platform configurations
    AMAZON_BASE_URL: str = "https://www.amazon.in"
    FLIPKART_BASE_URL: str = "https://www.flipkart.com"
    
    # Platform search configurations
    PLATFORM_CONFIGS = {
        "amazon": {
            "name": "Amazon India",
            "base_url": AMAZON_BASE_URL,
            "search_path": "/s",
            "search_param": "k"
        },
        "flipkart": {
            "name": "Flipkart",
            "base_url": FLIPKART_BASE_URL,
            "search_path": "/search",
            "search_param": "q"
        }
    }

settings = Settings()
