from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import os

# Use PostgreSQL URL from environment or default (Neon.tech)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_TYDdUmenq9b0@ep-small-dream-adtq7v05-pooler.c-2.us-east-1.aws.neon.tech/trison?sslmode=require&channel_binding=require")

# PostgreSQL setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    """Initialize database tables"""
    try:
        # Create all PostgreSQL tables
        Base.metadata.create_all(bind=engine)
        print("PostgreSQL database tables created successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")
        raise e 