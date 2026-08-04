import os
import psycopg2
from dotenv import load_dotenv

def main():
    # Load .env file
    dotenv_path = os.path.join(os.path.dirname(__file__), "..", "ai", ".env")
    print(f"Loading env from: {dotenv_path}")
    load_dotenv(dotenv_path)

    host = os.getenv("PGHOST", "rightnxtdb.postgres.database.azure.com")
    port = os.getenv("PGPORT", "5432")
    user = os.getenv("PGUSER", "rightnxtai")
    password = os.getenv("PGPASSWORD", "Nav@9009006739")
    database = os.getenv("PGDATABASE", "postgres")

    print(f"Connecting to host: {host}, database: {database}, user: {user}...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            sslmode="require"
        )
        conn.autocommit = True
        cursor = conn.cursor()

        migration_file = os.path.join(os.path.dirname(__file__), "..", "ai", "db_schemas", "007_premium_reports.sql")
        print(f"Reading migration file: {migration_file}")
        with open(migration_file, "r") as f:
            sql = f.read()

        print("Executing migration SQL...")
        cursor.execute(sql)
        print("Migration executed successfully!")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error executing migration: {e}")

if __name__ == "__main__":
    main()
