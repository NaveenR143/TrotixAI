"""
Audit Log Middleware - Captures request/response details and saves to PostgreSQL.
Implemented as a pure ASGI middleware for reliability, high performance, and to avoid
Starlette's BaseHTTPMiddleware body interception bugs.
"""

import time
import logging
import json
import http.cookies
from typing import Optional
from uuid import UUID

from ai.db.session_manager import db_session_manager
from ai.db.audit_log_repository import AuditLogRepository
from ai.utils.auth import SECRET_KEY, ALGORITHM
import jwt
import re
import urllib.parse
from typing import Any

logger = logging.getLogger(__name__)

def sanitize_data(data: Any) -> Any:
    sensitive_keys = {"otp", "password", "token", "access_token", "cookie", "authorization", "secret"}
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if k.lower() in sensitive_keys:
                sanitized[k] = "[REDACTED]"
            else:
                sanitized[k] = sanitize_data(v)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data

def sanitize_body(body_str: str) -> str:
    if not body_str:
        return body_str
    try:
        data = json.loads(body_str)
        return json.dumps(sanitize_data(data))
    except Exception:
        pass
    
    # Regex fallback for non-JSON or malformed payloads
    sensitive_pattern = re.compile(
        r'("(?:otp|password|token|access_token|secret)"\s*:\s*)"[^"]+"',
        re.IGNORECASE
    )
    return sensitive_pattern.sub(r'\1"[REDACTED]"', body_str)

def sanitize_query_params(query_str: Optional[str]) -> Optional[str]:
    if not query_str:
        return None
    try:
        params = urllib.parse.parse_qsl(query_str, keep_blank_values=True)
        sensitive_keys = {"otp", "password", "token", "access_token", "cookie", "authorization", "secret"}
        sanitized = []
        for k, v in params:
            if k.lower() in sensitive_keys:
                sanitized.append((k, "[REDACTED]"))
            else:
                sanitized.append((k, v))
        return urllib.parse.urlencode(sanitized)
    except Exception:
        return query_str


class AuditLogMiddleware:
    """
    ASGI middleware to capture API request and response data, logging them to PostgreSQL.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send) -> None:
        # We only inspect HTTP requests
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Exclude health check, metrics, swagger, redoc, and openapi endpoints
        exclude_keywords = ["/health", "/metrics", "/docs", "/redoc", "/openapi"]
        if any(keyword in path for keyword in exclude_keywords):
            await self.app(scope, receive, send)
            return

        start_time = time.perf_counter()

        # Extract headers for cookies and authorization
        headers = scope.get("headers", [])
        cookie_header = ""
        auth_header = ""
        for k, v in headers:
            if k == b"cookie":
                cookie_header = v.decode("utf-8", errors="replace")
            elif k == b"authorization":
                auth_header = v.decode("utf-8", errors="replace")

        # Safely extract user_id from cookies or Authorization header
        user_id = None
        token = None
        if cookie_header:
            try:
                cookie = http.cookies.SimpleCookie()
                cookie.load(cookie_header)
                if "access_token" in cookie:
                    token = cookie["access_token"].value
            except Exception:
                pass

        if not token and auth_header.startswith("Bearer "):
            token = auth_header[7:]

        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
            except Exception:
                # Ignore token decoding failures in middleware to avoid breaking execution
                pass

        # Check content type for multipart/form-data
        is_multipart = False
        for k, v in headers:
            if k == b"content-type":
                content_type = v.decode("utf-8", errors="replace")
                if "multipart/form-data" in content_type:
                    is_multipart = True
                break

        # Safely capture request body
        request_body = ""
        if is_multipart:
            request_body = "[Multipart Form Data]"
            custom_receive = receive
        else:
            body_bytes = b""
            more_body = True
            messages = []

            try:
                while more_body:
                    message = await receive()
                    if message["type"] != "http.request":
                        messages.append(message)
                        break
                    messages.append(message)
                    body_bytes += message.get("body", b"")
                    more_body = message.get("more_body", False)

                request_body = body_bytes.decode("utf-8", errors="replace")
            except Exception as e:
                request_body = f"[Error reading request body: {str(e)}]"

            # Replay the consumed request body messages and delegate subsequent ones (like disconnect)
            message_idx = 0

            async def custom_receive():
                nonlocal message_idx
                if message_idx < len(messages):
                    msg = messages[message_idx]
                    message_idx += 1
                    return msg
                return await receive()

        response_status = None
        response_body_bytes = b""

        # Wrapper to intercept response headers and body
        async def send_wrapper(message):
            nonlocal response_status, response_body_bytes
            if message["type"] == "http.response.start":
                response_status = message.get("status")
            elif message["type"] == "http.response.body":
                if response_status and response_status >= 400:
                    body = message.get("body", b"")
                    if body:
                        response_body_bytes += body
            await send(message)

        error_message = None

        try:
            await self.app(scope, custom_receive, send_wrapper)

            # If response is >= 400, extract details from the captured body
            if response_status and response_status >= 400:
                try:
                    resp_json = json.loads(response_body_bytes.decode("utf-8"))
                    if isinstance(resp_json, dict) and "detail" in resp_json:
                        error_message = str(resp_json["detail"])
                    else:
                        error_message = response_body_bytes.decode("utf-8")
                except Exception:
                    error_message = response_body_bytes.decode("utf-8", errors="replace")

        except Exception as e:
            error_message = str(e)
            response_status = 500
            raise e

        finally:
            # Calculate response time
            response_time_ms = int((time.perf_counter() - start_time) * 1000)

            # Get path and query params
            endpoint = scope.get("path", "")
            query_string = scope.get("query_string", b"").decode("utf-8", errors="replace")
            query_params = sanitize_query_params(query_string) if query_string else None

            # Log audit record asynchronously
            try:
                # Sanitize request body before database logging
                sanitized_body = sanitize_body(request_body)
                # Use db_session_manager to get an independent database session
                async with db_session_manager.session() as session:
                    await AuditLogRepository.create_audit_log(
                        user_id=user_id,
                        method=scope.get("method", "UNKNOWN"),
                        endpoint=endpoint,
                        query_params=query_params,
                        request_body=sanitized_body,
                        response_status=response_status,
                        response_time_ms=response_time_ms,
                        error_message=error_message,
                        session=session,
                    )
            except Exception as e:
                # Add structured logging for audit logging failures
                logger.error(
                    "Audit logging failure",
                    extra={
                        "error": str(e),
                        "request_path": endpoint,
                        "request_method": scope.get("method", "UNKNOWN"),
                        "user_id": user_id,
                    },
                    exc_info=True,
                )
