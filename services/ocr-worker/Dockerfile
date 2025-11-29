# syntax=docker/dockerfile:1.6

FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3.10 \
        python3-pip \
        python3.10-venv \
        curl \
        ffmpeg \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip install --upgrade pip

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV OCR_WORKER_PORT=8080 \
    OCR_WORKER_COMPRESSION=medium \
    OCR_WORKER_LOG_LEVEL=info \
    OCR_WORKER_ALLOW_MOCK=true

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
