import asyncio
import base64
import io
import logging
import os
import time
import uuid
from typing import Any, Dict, Optional

import httpx
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse
from PIL import Image

logger = logging.getLogger("ocr-worker")
logging.basicConfig(level=os.getenv("OCR_WORKER_LOG_LEVEL", "info").upper())

app = FastAPI(title="LightDom DeepSeek OCR Worker", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OCRPayload(BaseModel):
    fileUrl: Optional[str] = Field(None, description="URL pointing to an image or PDF to OCR")
    base64Data: Optional[str] = Field(
        None, description="Base64 encoded image bytes (PNG/JPEG/PDF). Data URI prefixes supported."
    )
    compressionRatio: Optional[float] = Field(
        default=None, ge=0.0, le=1.0, description="Optional pre-compression ratio suggestion."
    )
    languageHint: Optional[str] = Field(
        default=None, description="Optional BCP-47 language code to guide OCR model."
    )

    class Config:
        schema_extra = {
            "example": {
                "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANS...",
                "compressionRatio": 0.35,
                "languageHint": "en",
            }
        }


class OCRResultBlock(BaseModel):
    text: str
    confidence: float
    bbox: Optional[list[float]] = None


class OCRResponse(BaseModel):
    requestId: str
    text: str
    language: Optional[str] = None
    confidence: Optional[float] = None
    blocks: list[OCRResultBlock]
    model: Optional[str] = None
    latencyMs: int


async def fetch_remote_bytes(url: str, timeout: float = 15.0) -> bytes:
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


def decode_base64(data: str) -> bytes:
    if data.startswith("data:"):
        header, _, body = data.partition(",")
        if not body:
            raise ValueError("Invalid data URI")
        data = body
    return base64.b64decode(data)


def ensure_size_limit(payload: bytes) -> None:
    limit_mb = float(os.getenv("OCR_WORKER_MAX_IMAGE_MB", "25"))
    if len(payload) > limit_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Payload exceeds {limit_mb} MB limit")


async def forward_to_remote(artifact: bytes, payload: OCRPayload) -> Dict[str, Any]:
    endpoint = os.getenv("OCR_REMOTE_ENDPOINT")
    if not endpoint:
        raise RuntimeError("OCR_REMOTE_ENDPOINT not configured")

    async with httpx.AsyncClient(timeout=float(os.getenv("OCR_REMOTE_TIMEOUT", "30"))) as client:
        files = {"file": ("document", artifact, "application/octet-stream")}
        data = {
            "compression_ratio": payload.compressionRatio,
            "language_hint": payload.languageHint,
        }
        response = await client.post(endpoint, data={k: v for k, v in data.items() if v is not None}, files=files)
        response.raise_for_status()
        return response.json()


def mock_ocr_response(artifact: bytes) -> Dict[str, Any]:
    checksum = base64.b16encode(os.urandom(4)).decode("ascii")
    fake_text = f"[MOCK OCR] Document digest {checksum}"
    logger.info("Returning mock OCR response (mock mode enabled)")
    return {
        "text": fake_text,
        "language": None,
        "confidence": 0.0,
        "blocks": [
            {
                "text": fake_text,
                "confidence": 0.0,
                "bbox": None,
            }
        ],
        "model": "mock",
    }


def preprocess_image(artifact: bytes, compression_ratio: Optional[float]) -> bytes:
    ratio = compression_ratio
    if ratio is None:
        env_ratio = os.getenv("OCR_WORKER_COMPRESSION")
        if env_ratio:
            try:
                ratio = float(env_ratio)
            except ValueError:
                ratio = None

    if ratio is None or ratio <= 0 or ratio >= 1:
        return artifact

    try:
        with Image.open(io.BytesIO(artifact)) as image:
            target_size = tuple(max(1, int(dim * ratio)) for dim in image.size)
            image = image.resize(target_size)
            buf = io.BytesIO()
            image.save(buf, format=image.format or "PNG", optimize=True)
            buf.seek(0)
            return buf.read()
    except Exception as error:  # pylint: disable=broad-except
        logger.warning("Failed to compress image: %s", error)
        return artifact


async def run_local_ocr(artifact: bytes) -> Dict[str, Any]:
    # TODO: integrate DeepSeek-OCR runtime binary/script once available.
    allow_mock = os.getenv("OCR_WORKER_ALLOW_MOCK", "true").lower() == "true"
    if not allow_mock:
        raise HTTPException(status_code=503, detail="DeepSeek OCR engine not yet integrated")
    return mock_ocr_response(artifact)


async def perform_ocr(payload: OCRPayload, file: Optional[UploadFile]) -> Dict[str, Any]:
    if not payload.base64Data and not payload.fileUrl and not file:
        raise HTTPException(status_code=400, detail="Provide upload file, fileUrl, or base64Data")

    artifact_bytes = None

    if file:
        artifact_bytes = await file.read()
    elif payload.base64Data:
        artifact_bytes = decode_base64(payload.base64Data)
    elif payload.fileUrl:
        artifact_bytes = await fetch_remote_bytes(payload.fileUrl)

    if artifact_bytes is None:
        raise HTTPException(status_code=400, detail="Unable to prepare artifact for OCR")

    ensure_size_limit(artifact_bytes)
    artifact_bytes = preprocess_image(artifact_bytes, payload.compressionRatio)

    if os.getenv("OCR_REMOTE_ENDPOINT"):
        return await forward_to_remote(artifact_bytes, payload)

    return await run_local_ocr(artifact_bytes)


@app.get("/health", response_model=dict)
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "mode": "remote" if os.getenv("OCR_REMOTE_ENDPOINT") else "local",
        "mock": os.getenv("OCR_WORKER_ALLOW_MOCK", "true").lower() == "true",
    }


@app.post("/ocr", response_model=OCRResponse)
async def ocr_endpoint(
    payload: OCRPayload,
    file: Optional[UploadFile] = File(default=None),
) -> OCRResponse:
    request_id = str(uuid.uuid4())
    started_at = time.perf_counter()

    try:
        raw_result = await perform_ocr(payload, file)
    except HTTPException:
        raise
    except httpx.HTTPStatusError as error:
        logger.exception("Remote OCR returned error: %s", error)
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:  # pylint: disable=broad-except
        logger.exception("OCR processing failed: %s", error)
        raise HTTPException(status_code=500, detail="OCR processing failed") from error

    latency_ms = int((time.perf_counter() - started_at) * 1000)

    response = OCRResponse(
        requestId=request_id,
        text=raw_result.get("text", ""),
        language=raw_result.get("language"),
        confidence=raw_result.get("confidence"),
        model=raw_result.get("model"),
        blocks=[
            OCRResultBlock(
                text=block.get("text", ""),
                confidence=float(block.get("confidence", 0)),
                bbox=block.get("bbox"),
            )
            for block in raw_result.get("blocks", [])
        ],
        latencyMs=latency_ms,
    )

    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):  # type: ignore[override]
    logger.exception("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.on_event("startup")
async def on_startup():
    logger.info(
        "DeepSeek OCR worker starting (mode=%s, mock=%s)",
        "remote" if os.getenv("OCR_REMOTE_ENDPOINT") else "local",
        os.getenv("OCR_WORKER_ALLOW_MOCK", "true"),
    )


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("DeepSeek OCR worker shutting down")
    # close any async resources if needed in future
    await asyncio.sleep(0)
