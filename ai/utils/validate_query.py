import sqlparse
import re
import html
import string


def validate_sql(query: str) -> bool:
    """Validate SQL query syntax & execution."""
    # Step 1: Syntax Check
    try:
        parsed = sqlparse.parse(query)
        if len(parsed) == 0:
            print("Invalid SQL syntax")
            return False
    except Exception:
        print("Invalid SQL syntax")
        return False


# Function to validate user input
def validate_input(user_input):
    # Check for SQL Injection (basic version)
    if re.search(
        r"(--|\b(INSERT|UPDATE|DELETE|ALTER|EXEC)\b|\bDROP\s+(TABLE|DATABASE|VIEW|INDEX|PROCEDURE|FUNCTION|TRIGGER)\b)",
        user_input,
        re.IGNORECASE,
    ):
        return False

    # Check for command injection (basic version)
    dangerous_chars = [";", "&", "|", "$", "`"]
    if any(char in user_input for char in dangerous_chars):
        return False

    # Escape HTML tags to prevent XSS
    sanitized_input = html.escape(user_input)

    # Further sanitize the string (remove non-alphanumeric characters)
    sanitized_input = "".join([c for c in sanitized_input if c in string.printable])

    return sanitized_input
