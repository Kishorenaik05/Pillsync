import os
import glob
from app.db.connection import get_db_connection

def run_migrations():
    """Run all SQL migrations in the migrations folder."""
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    migration_files = sorted(glob.glob(os.path.join(migrations_dir, '*.sql')))
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                for file_path in migration_files:
                    print(f"Running migration: {os.path.basename(file_path)}")
                    with open(file_path, 'r') as file:
                        sql = file.read()
                        cur.execute(sql)
            conn.commit()
            print("All migrations completed successfully.")
    except Exception as e:
        print(f"Warning: migrations could not run (DB may not be ready yet): {e}")

if __name__ == "__main__":
    run_migrations()
