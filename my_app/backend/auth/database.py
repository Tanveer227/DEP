# backend/auth/database.py
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from config import Config

# Create SQLAlchemy engine
engine = create_engine(Config.DATABASE_URL, echo=True)  # echo=True for debug logging
metadata = MetaData()

# Define the users table
users_table = Table(
    'users', metadata,
    Column('id', Integer, primary_key=True),
    Column('username', String(80), unique=True, nullable=False),
    Column('password', String(120), nullable=False)
)

# Create the table if it doesn't exist
metadata.create_all(engine)

def get_engine():
    return engine