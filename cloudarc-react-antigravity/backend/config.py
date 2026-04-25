import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # SECURITY FIX: Crash loudly with a useful message if SECRET_KEY is not set —
    # never silently fall back to a known public string that any attacker can use.
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise RuntimeError(
            "FATAL: SECRET_KEY environment variable is not set. "
            "Add it to your .env file: SECRET_KEY=<strong-random-string>"
        )

    DATABASE = os.getenv('DATABASE', 'cloudarc.db')
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

    # SECURITY NOTE: 1-week JWT is too long. Reduced to 24h.
    # True logout still requires a server-side blocklist (not implemented yet),
    # but short-lived tokens limit damage from token theft.
    JWT_EXPIRY_HOURS = 24
