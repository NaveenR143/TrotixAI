# ==========================================
# Stage 1: Build & Dependency Stage
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system build dependencies required for compiling Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create and use virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

# Upgrade pip and install requirements
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download the Hugging Face model so it's baked into the image.
# This prevents downloading at runtime, which avoids read-only filesystem errors
# and improves container startup performance.
RUN python -c 'from sentence_transformers import SentenceTransformer; import os; model = SentenceTransformer("all-MiniLM-L6-v2"); os.makedirs("./model", exist_ok=True); model.save("./model"); print("Model pre-downloaded and saved to ./model")'

# ==========================================
# Stage 2: Final Runtime Stage
# ==========================================
FROM python:3.11-slim

# Install runtime system dependencies for document parsing and OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    antiword \
    unrtf \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy pre-downloaded sentence-transformer model from builder stage
COPY --from=builder /app/model /app/model

# Copy application source code
COPY . .

# Set environment variables for production python container
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1

# Create a non-root user and group for security hardening (Azure Container Apps best practice)
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set entrypoint to run the queue worker
CMD ["python", "worker.py"]