import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from app.core.config import settings

# Initialize a global connection pool
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, 
        10, 
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD
    )
    if connection_pool:
        print("PostgreSQL connection pool created successfully")
except Exception as e:
    print(f"Error connecting to PostgreSQL: {e}")
    connection_pool = None

@contextmanager
def get_db_connection():
    if connection_pool is None:
        raise Exception("Database connection pool is not initialized.")
    conn = connection_pool.getconn()
    try:
        yield conn
    finally:
        connection_pool.putconn(conn)
