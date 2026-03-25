from __future__ import annotations

import re


class ResumePreprocessor:
    """Cleans noisy text before deterministic parsing and AI refinement."""

    _header_footer_patterns = (
        re.compile(r"^page\s+\d+(\s+of\s+\d+)?$", re.IGNORECASE),
        re.compile(r"^curriculum vitae$", re.IGNORECASE),
        re.compile(r"^resume$", re.IGNORECASE),
    )

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

