"""
Docling Document Conversion Service

FastAPI microservice that wraps Docling for document conversion.
Supports: PDF, DOCX, PPTX, HTML, Images, AsciiDoc, Markdown, and more.

Start with: uvicorn docling_service:app --host 0.0.0.0 --port 8001
"""

import os
import io
import json
import tempfile
import hashlib
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Docling imports
try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling_core.types.doc import DoclingDocument
    DOCLING_AVAILABLE = True
except ImportError:
    DOCLING_AVAILABLE = False
    print("Warning: Docling not installed. Run: pip install docling")

app = FastAPI(
    title="Docling Document Conversion Service",
    description="Convert documents (PDF, DOCX, PPTX, HTML, images) to structured formats for RAG",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported formats
SUPPORTED_FORMATS = {
    "pdf": ["application/pdf"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    "xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    "html": ["text/html"],
    "image": ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/tiff", "image/bmp"],
    "markdown": ["text/markdown", "text/x-markdown"],
    "asciidoc": ["text/asciidoc"],
}

# Flatten for quick lookup
ALL_SUPPORTED_MIMETYPES = []
for formats in SUPPORTED_FORMATS.values():
    ALL_SUPPORTED_MIMETYPES.extend(formats)

# Response models
class ConversionResult(BaseModel):
    success: bool
    document_id: str
    format: str
    text: str
    markdown: Optional[str] = None
    chunks: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}
    tables: List[Dict[str, Any]] = []
    figures: List[Dict[str, Any]] = []
    sections: List[Dict[str, Any]] = []
    processing_time_ms: float
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    docling_available: bool
    supported_formats: List[str]
    version: str

# Global converter instance (lazy initialized)
_converter = None

def get_converter():
    """Get or create the Docling converter instance."""
    global _converter
    if _converter is None and DOCLING_AVAILABLE:
        # Configure pipeline options for better OCR
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = True
        pipeline_options.do_table_structure = True
        
        _converter = DocumentConverter()
    return _converter

def extract_text_from_docling_doc(doc: 'DoclingDocument') -> str:
    """Extract plain text from Docling document."""
    return doc.export_to_text()

def extract_markdown_from_docling_doc(doc: 'DoclingDocument') -> str:
    """Extract markdown from Docling document."""
    return doc.export_to_markdown()

def extract_sections(doc: 'DoclingDocument') -> List[Dict[str, Any]]:
    """Extract document sections/structure."""
    sections = []
    try:
        # Iterate through document items
        for item in doc.iterate_items():
            if hasattr(item, 'label') and hasattr(item, 'text'):
                sections.append({
                    "type": str(item.label) if hasattr(item, 'label') else "content",
                    "text": str(item.text) if hasattr(item, 'text') else "",
                    "level": getattr(item, 'level', 0),
                })
    except Exception as e:
        print(f"Warning: Could not extract sections: {e}")
    return sections

def extract_tables(doc: 'DoclingDocument') -> List[Dict[str, Any]]:
    """Extract tables from Docling document."""
    tables = []
    try:
        for table in doc.tables:
            table_data = {
                "id": str(getattr(table, 'id', '')),
                "rows": [],
                "caption": getattr(table, 'caption', ''),
            }
            if hasattr(table, 'data'):
                for row in table.data:
                    table_data["rows"].append([str(cell) for cell in row])
            tables.append(table_data)
    except Exception as e:
        print(f"Warning: Could not extract tables: {e}")
    return tables

def extract_figures(doc: 'DoclingDocument') -> List[Dict[str, Any]]:
    """Extract figure/image references from Docling document."""
    figures = []
    try:
        for fig in doc.pictures:
            figures.append({
                "id": str(getattr(fig, 'id', '')),
                "caption": getattr(fig, 'caption', ''),
                "page": getattr(fig, 'page_no', None),
            })
    except Exception as e:
        print(f"Warning: Could not extract figures: {e}")
    return figures

def create_chunks(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, Any]]:
    """Create text chunks for RAG indexing."""
    chunks = []
    if not text:
        return chunks
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    current_chunk = ""
    chunk_index = 0
    
    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk += ("\n\n" if current_chunk else "") + para
        else:
            if current_chunk:
                chunks.append({
                    "index": chunk_index,
                    "content": current_chunk.strip(),
                    "char_start": 0,  # Simplified
                    "char_end": len(current_chunk),
                })
                chunk_index += 1
            current_chunk = para
    
    # Don't forget the last chunk
    if current_chunk:
        chunks.append({
            "index": chunk_index,
            "content": current_chunk.strip(),
            "char_start": 0,
            "char_end": len(current_chunk),
        })
    
    return chunks

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy" if DOCLING_AVAILABLE else "degraded",
        docling_available=DOCLING_AVAILABLE,
        supported_formats=list(SUPPORTED_FORMATS.keys()),
        version="1.0.0",
    )

@app.get("/formats")
async def get_supported_formats():
    """Get list of supported document formats."""
    return {
        "formats": SUPPORTED_FORMATS,
        "all_mimetypes": ALL_SUPPORTED_MIMETYPES,
    }

@app.post("/convert", response_model=ConversionResult)
async def convert_document(
    file: UploadFile = File(...),
    chunk_size: int = Form(default=1000),
    chunk_overlap: int = Form(default=200),
    extract_tables: bool = Form(default=True),
    extract_figures: bool = Form(default=True),
):
    """
    Convert a document to structured text format.
    
    Supports: PDF, DOCX, PPTX, XLSX, HTML, Images, Markdown, AsciiDoc
    
    Returns structured data including:
    - Plain text
    - Markdown
    - Chunks for RAG indexing
    - Tables
    - Figures
    - Document sections
    """
    start_time = datetime.now()
    
    if not DOCLING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Docling is not installed. Please install with: pip install docling"
        )
    
    # Validate file type
    content_type = file.content_type or ""
    if content_type not in ALL_SUPPORTED_MIMETYPES:
        # Try to detect from extension
        ext = Path(file.filename or "").suffix.lower()
        valid_ext = ext in ['.pdf', '.docx', '.pptx', '.xlsx', '.html', '.htm', '.md', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.tiff', '.bmp', '.adoc']
        if not valid_ext:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {content_type}. Supported: {list(SUPPORTED_FORMATS.keys())}"
            )
    
    try:
        # Read file content
        content = await file.read()
        
        # Generate document ID
        doc_id = hashlib.sha256(content).hexdigest()[:16]
        
        # Save to temp file (Docling needs a file path)
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename or "doc").suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            # Convert with Docling
            converter = get_converter()
            result = converter.convert(tmp_path)
            doc = result.document
            
            # Extract content
            text = extract_text_from_docling_doc(doc)
            markdown = extract_markdown_from_docling_doc(doc)
            sections = extract_sections(doc)
            tables_data = extract_tables(doc) if extract_tables else []
            figures_data = extract_figures(doc) if extract_figures else []
            chunks = create_chunks(text, chunk_size, chunk_overlap)
            
            # Determine format
            ext = Path(file.filename or "").suffix.lower().lstrip('.')
            doc_format = ext if ext else "unknown"
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return ConversionResult(
                success=True,
                document_id=doc_id,
                format=doc_format,
                text=text,
                markdown=markdown,
                chunks=chunks,
                metadata={
                    "filename": file.filename,
                    "content_type": content_type,
                    "size_bytes": len(content),
                    "page_count": getattr(doc, 'page_count', None),
                    "chunk_count": len(chunks),
                    "table_count": len(tables_data),
                    "figure_count": len(figures_data),
                },
                tables=tables_data,
                figures=figures_data,
                sections=sections,
                processing_time_ms=processing_time,
            )
            
        finally:
            # Cleanup temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        return ConversionResult(
            success=False,
            document_id="",
            format="unknown",
            text="",
            processing_time_ms=processing_time,
            error=str(e),
        )

@app.post("/convert/batch")
async def convert_batch(
    files: List[UploadFile] = File(...),
    chunk_size: int = Form(default=1000),
):
    """Convert multiple documents in batch."""
    results = []
    for file in files:
        result = await convert_document(file, chunk_size)
        results.append(result)
    return {"results": results, "total": len(results)}

@app.post("/convert/url")
async def convert_from_url(
    url: str = Form(...),
    chunk_size: int = Form(default=1000),
):
    """Convert a document from URL."""
    if not DOCLING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Docling not available")
    
    try:
        converter = get_converter()
        result = converter.convert(url)
        doc = result.document
        
        text = extract_text_from_docling_doc(doc)
        markdown = extract_markdown_from_docling_doc(doc)
        chunks = create_chunks(text, chunk_size)
        
        return ConversionResult(
            success=True,
            document_id=hashlib.sha256(url.encode()).hexdigest()[:16],
            format="url",
            text=text,
            markdown=markdown,
            chunks=chunks,
            metadata={"source_url": url},
            tables=[],
            figures=[],
            sections=[],
            processing_time_ms=0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
