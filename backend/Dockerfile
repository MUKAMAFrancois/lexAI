FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the entire app package to maintain structure
COPY app/ ./app/

# Run uvicorn with app.main:app to match the package structure
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}