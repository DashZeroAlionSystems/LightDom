# Docling Document Conversion Service

This service provides document conversion capabilities using the [Docling](https://github.com/DS4SD/docling) library, enabling the RAG system to process various document formats.

## Supported Formats

| Format | Extension | MIME Type |
|--------|-----------|-----------|
| PDF | `.pdf` | `application/pdf` |
| Word Document | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| PowerPoint | `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| Excel | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| HTML | `.html`, `.htm` | `text/html` |
| Markdown | `.md` | `text/markdown` |
| AsciiDoc | `.adoc` | `text/asciidoc` |
| Images | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.tiff`, `.bmp` | `image/*` |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run
docker build -t docling-service .
docker run -p 8001:8001 docling-service
```

### Option 2: Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn docling_service:app --host 0.0.0.0 --port 8001
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "docling_available": true,
  "supported_formats": ["pdf", "docx", "pptx", "xlsx", "html", "image", "markdown", "asciidoc"],
  "version": "1.0.0"
}
```

### Get Supported Formats
```bash
GET /formats
```

### Convert Document
```bash
POST /convert
Content-Type: multipart/form-data

file: <file>
chunk_size: 1000 (optional)
chunk_overlap: 200 (optional)
extract_tables: true (optional)
extract_figures: true (optional)
```

Response:
```json
{
  "success": true,
  "document_id": "abc123...",
  "format": "pdf",
  "text": "Extracted plain text...",
  "markdown": "# Extracted Markdown...",
  "chunks": [
    {
      "index": 0,
      "content": "First chunk...",
      "char_start": 0,
      "char_end": 1000
    }
  ],
  "tables": [...],
  "figures": [...],
  "sections": [...],
  "metadata": {
    "filename": "document.pdf",
    "page_count": 10,
    "chunk_count": 15
  },
  "processing_time_ms": 1234.5
}
```

### Convert from URL
```bash
POST /convert/url
Content-Type: multipart/form-data

url: https://example.com/document.pdf
chunk_size: 1000 (optional)
```

## Integration with RAG Service

The Docling service integrates with the unified RAG service via these endpoints:

### Via Node.js RAG API

```bash
# Convert and index a document
POST /api/unified-rag/convert
Content-Type: multipart/form-data

file: <document>
title: "My Document"

# Convert from URL
POST /api/unified-rag/convert/url
Content-Type: application/json

{"url": "https://example.com/doc.pdf", "title": "My Doc"}

# Get supported formats
GET /api/unified-rag/convert/formats
```

### Via React Hook

```tsx
import { useUnifiedRAG } from '@/hooks/useUnifiedRAG';

function DocumentUpload() {
  const { convertDocument, isLoading } = useUnifiedRAG();

  const handleUpload = async (file: File) => {
    const result = await convertDocument(file, {
      title: file.name,
      extractTables: true,
    });
    
    console.log('Indexed:', result.documentId);
    console.log('Chunks:', result.chunksIndexed);
    console.log('Tables:', result.conversion.tables);
  };

  return (
    <input 
      type="file" 
      accept=".pdf,.docx,.pptx,.xlsx,.html,.md"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCLING_ENDPOINT` | `http://localhost:8001` | Docling service URL |
| `DOCLING_CHUNK_SIZE` | `1000` | Default chunk size |
| `DOCLING_CHUNK_OVERLAP` | `200` | Default chunk overlap |

## Features

### OCR for Images and Scanned PDFs
Docling includes OCR capabilities for processing images and scanned PDF documents.

### Table Extraction
Tables are extracted with structure preserved, including row and column data.

### Figure Detection
Images and figures within documents are detected and their captions extracted.

### Section Awareness
Document structure (headings, paragraphs, lists) is preserved in the output.

## Performance Considerations

- First conversion may be slower as models are loaded
- PDF processing with OCR takes longer than text-based documents
- Large documents (>100 pages) should use streaming or batch endpoints

## Troubleshooting

### Docling not available
Ensure Python dependencies are installed:
```bash
pip install docling docling-core
```

### OCR not working
Install Tesseract:
```bash
# Ubuntu/Debian
apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### PDF rendering issues
Install Poppler:
```bash
# Ubuntu/Debian
apt-get install poppler-utils

# macOS
brew install poppler
```
