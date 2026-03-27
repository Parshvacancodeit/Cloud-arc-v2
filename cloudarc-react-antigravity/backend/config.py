import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'cloudarc-fallback-secret-change-me')
    DATABASE = os.getenv('DATABASE', 'cloudarc.db')
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    JWT_EXPIRY_HOURS = 24 * 7  # 1 week
