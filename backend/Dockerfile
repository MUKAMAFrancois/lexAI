FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy everything from the local backend/app folder into the container's /app folder
COPY app/ .

# Since we are now INSIDE the folder where main.py lives, 
# we call it as 'main:app' instead of 'app.main:app'
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]