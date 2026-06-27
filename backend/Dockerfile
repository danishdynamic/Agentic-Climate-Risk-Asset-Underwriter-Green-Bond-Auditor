# =====================================================================
# Stage 1: Build dependencies and compile C-extensions (Numpy, asyncpg)
# =====================================================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install minimal toolchain required for building Python binary extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the dependency definitions to maximize Docker layer caching
COPY requirements.txt .

# Install dependencies into a localized wheelhouse folder
RUN pip install --no-cache-dir --user -r requirements.txt


# =====================================================================
# Stage 2: Minimal Runtime Environment
# =====================================================================
FROM python:3.11-slim AS runtime

WORKDIR /workspace

# Install runtime dependencies (libpq is needed for asyncpg Postgres communication)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed site-packages directly from the builder stage
COPY --from=builder /root/.local /root/.local
COPY --from=builder /build /workspace

# Ensure the executable paths map to the copied user packages
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/workspace

# Copy your local source files into the runtime directory
COPY app/ ./app/

# Expose FastAPI's default network execution port
EXPOSE 8000

# Fire up Uvicorn bound to all interfaces
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]