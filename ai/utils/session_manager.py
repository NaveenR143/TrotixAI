import mysql.connector
import logging
from typing import List, Dict, Any
from db.generate_mysql_schema import MysqlSchemaGenerator

logger = logging.getLogger(__name__)


class SessionManager:
    def __init__(self, schema_gen: MysqlSchemaGenerator):
        self.schema_gen = schema_gen

    def save_message(self, session_id: str, role: str, content: str):
        """Saves a message to the user_sessions table."""
        try:
            config = self.schema_gen.get_config()
            conn = mysql.connector.connect(**config)
            cursor = conn.cursor()

            cursor.execute(
                "INSERT INTO user_sessions (session_id, role, content) VALUES (%s, %s, %s)",
                (session_id, role, content),
            )

            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            logger.error(f"Error saving message to session {session_id}: {e}")

    def get_history(self, session_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieves history for a session_id, ordered by timestamp."""
        try:
            config = self.schema_gen.get_config()
            conn = mysql.connector.connect(**config)
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT role, content FROM user_sessions WHERE session_id = %s ORDER BY timestamp DESC LIMIT %s",
                (session_id, limit),
            )

            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            # Reverse to get chronological order
            history = [
                {"role": row["role"], "content": row["content"]}
                for row in reversed(rows)
            ]
            return history
        except Exception as e:
            logger.error(f"Error fetching history for session {session_id}: {e}")
            return []
