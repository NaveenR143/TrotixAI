import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

def refresh_schema():
    # Load environment variables from ai/.env
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)

    # Database configuration
    db_name = os.getenv("PGDATABASE", "trotixai")
    db_user = os.getenv("PGUSER", "postgres")
    db_pass = os.getenv("PGPASSWORD", "sa123")
    db_host = os.getenv("PGHOST", "localhost")
    db_port = os.getenv("PGPORT", "5432")

    # Output path
    output_dir = Path(__file__).parent.parent / "db_schemas"
    output_file = output_dir / "latest_snapshot.sql"

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Refreshing schema for database: {db_name}...")
    
    # Construct pg_dump command
    # -s: schema only
    # -O: no owner info
    # -x: no privilege info
    cmd = [
        "pg_dump",
        "-h", db_host,
        "-p", db_port,
        "-U", db_user,
        "-s",
        "-O",
        "-x",
        db_name
    ]

    # Set PGPASSWORD environment variable for pg_dump
    env = os.environ.copy()
    env["PGPASSWORD"] = db_pass

    try:
        # Run pg_dump and capture output
        result = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            check=True
        )

        # Write to file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(result.stdout)

        print(f"Success! Schema stored in: {output_file}")
        
    except subprocess.CalledProcessError as e:
        print(f"Error running pg_dump: {e.stderr}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    refresh_schema()
