import contextvars
from typing import Dict, Any

# ContextVar to store token usage per request
token_usage_var = contextvars.ContextVar("token_usage", default={})


def reset_token_usage():
    token_usage_var.set({})


def add_usage(model: str, usage: Any):
    if not usage:
        return
    current_usage = token_usage_var.get().copy()
    if model not in current_usage:
        current_usage[model] = {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        }

    # Handle both object-like (OpenAI response) and dict-like usage
    if hasattr(usage, "prompt_tokens"):
        current_usage[model]["prompt_tokens"] += usage.prompt_tokens
        current_usage[model]["completion_tokens"] += usage.completion_tokens
        current_usage[model]["total_tokens"] += usage.total_tokens
    elif isinstance(usage, dict):
        current_usage[model]["prompt_tokens"] += usage.get("prompt_tokens", 0)
        current_usage[model]["completion_tokens"] += usage.get("completion_tokens", 0)
        current_usage[model]["total_tokens"] += usage.get("total_tokens", 0)

    token_usage_var.set(current_usage)


def get_token_usage():
    return token_usage_var.get()
