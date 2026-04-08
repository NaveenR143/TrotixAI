from __future__ import annotations

import re
import tiktoken

from ai.services.resume_pipeline.models import DeterministicResumeData


class ResumePreprocessor:
    """Cleans noisy text before deterministic parsing and AI refinement."""

    _header_footer_patterns = (
        re.compile(r"^page\s+\d+(\s+of\s+\d+)?$", re.IGNORECASE),
        re.compile(r"^curriculum vitae$", re.IGNORECASE),
        re.compile(r"^resume$", re.IGNORECASE),
    )

    # PII patterns to remove from clean text
    EMAIL_RE = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
    PHONE_RE = re.compile(r"\+?\d[\d\-\s()]{7,}\d")
    LANGUAGE_KEYWORDS = {
        "english", "hindi", "telugu", "tamil", "kannada", "marathi", "gujarati",
        "bengali", "urdu", "punjabi", "mandarin", "spanish", "french", "german",
        "portuguese", "italian", "russian", "japanese", "korean", "arabic", "dutch"
    }

    def preprocess(self, raw_text: str) -> str:
        lines = [line.strip() for line in raw_text.splitlines()]
        normalized: list[str] = []
        seen: set[str] = set()

        for line in lines:
            if not line:
                continue
            compact = re.sub(r"\s+", " ", line).strip()
            if self._is_noise(compact):
                continue
            dedupe_key = compact.lower()
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            normalized.append(compact)

        return "\n".join(normalized)

    def chunk(self, clean_text: str, max_chars: int = 3500) -> list[str]:
        if len(clean_text) <= max_chars:
            return [clean_text]

        chunks: list[str] = []
        current: list[str] = []
        current_size = 0
        for line in clean_text.splitlines():
            if current_size + len(line) + 1 > max_chars and current:
                chunks.append("\n".join(current))
                current = [line]
                current_size = len(line)
            else:
                current.append(line)
                current_size += len(line) + 1
        if current:
            chunks.append("\n".join(current))
        return chunks

    def _is_noise(self, line: str) -> bool:
        return any(pattern.match(line) for pattern in self._header_footer_patterns)

    def remove_pii(self, clean_text: str, data: DeterministicResumeData) -> str:
        """
        Remove PII using already extracted deterministic data
        (name, email, phone, languages, location, etc.)
        to reduce tokens before sending to model.
        """
        lines = clean_text.splitlines()
        filtered_lines: list[str] = []

        # Normalize deterministic values for comparison
        name = (data.name or "").lower()
        email = (data.email or "").lower()
        phone = (data.phone or "")
        languages = {lang.lower() for lang in (data.languages or [])}

        for line in lines:
            line_lower = line.lower().strip()

            # Skip empty lines early
            if not line_lower:
                continue

            # 1. Remove email (deterministic + regex fallback)
            if email and email in line_lower:
                continue
            if self.EMAIL_RE.search(line):
                continue

            # 2. Remove phone
            if phone and phone in line:
                continue
            if self.PHONE_RE.search(line):
                continue

            # 3. Remove name (exact or near match)
            if name and name in line_lower:
                continue

            # 4. Remove language lines using extracted languages
            if languages:
                lang_hits = sum(1 for lang in languages if lang in line_lower)
                if lang_hits >= 2:  # strong signal it's a language line
                    continue

            # # 5. Fallback heuristics (optional but useful)
            # if self._is_language_line(line):
            #     continue
            # if self._is_potential_name_line(line):
            #     continue

            filtered_lines.append(line)

        return "\n".join(filtered_lines)

    def _is_language_line(self, line: str) -> bool:
        """Check if a line is primarily listing languages."""
        lower_line = line.lower()
        language_count = sum(
            1 for lang in self.LANGUAGE_KEYWORDS if lang in lower_line)
        # If line has multiple languages or starts with language keywords, skip it
        if "language" in lower_line or "languages" in lower_line:
            return True
        if language_count >= 2:
            return True
        return False

    def _is_potential_name_line(self, line: str) -> bool:
        """Check if a line looks like a name (short, 2-3 words, no special chars except spaces & hyphens)."""
        stripped = line.strip()
        word_count = len(stripped.split())
        # Names are typically 2-3 words, short, and have no digits or email/phone patterns
        if word_count in (2, 3) and len(stripped) < 50 and not any(ch.isdigit() for ch in stripped):
            if not self.EMAIL_RE.search(stripped) and not self.PHONE_RE.search(stripped):
                # Check if no special characters like ":", "," that indicate it's not a name
                if not re.search(r'[,:;@!#$%^&*()+=\[\]{}|\\`~<>?]', stripped):
                    return True
        return False

    def count_tokens(self, text: str, model: str = "gpt-4o-mini") -> int:
        try:
            enc = tiktoken.encoding_for_model(model)
        except KeyError:
            enc = tiktoken.get_encoding("cl100k_base")  # fallback
        return len(enc.encode(text))
