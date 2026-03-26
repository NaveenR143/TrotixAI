import psycopg2
import sys

def connect_to_postgres():
    """Connect to the PostgreSQL database server and print the version."""
    conn = None
    try:
        print('Connecting to the PostgreSQL database...')
        # Replace with your actual database details
        conn = psycopg2.connect(
            host="localhost",
            dbname="trotixai",
            user="postgres",
            password="sa123",
            port=5432
        )
        
        # Create a cursor object
        cur = conn.cursor()
        
        # Execute a sample query (e.g., get the database version)
        cur.execute('SELECT version()')
        
        # Fetch the result
        db_version = cur.fetchone()
        print(f'Connected! PostgreSQL database version: {db_version}')
        
        # Close the cursor and connection
        cur.close()
        
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error connecting to the database: {error}")
        sys.exit(1) # Exit the script if connection fails
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')

if __name__ == '__main__':
    connect_to_postgres()
