import axios from 'axios';
import pdfParse from 'pdf-parse';
import { YoutubeTranscript } from 'youtube-transcript';

const SUPPORTED_TEXT_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'text/html',
  'text/csv',
  'application/json',
  'application/xml',
  'application/xhtml+xml',
]);

const SUPPORTED_PDF_TYPES = new Set(['application/pdf']);

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

const SUPPORTED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
]);

const DEFAULT_OCR_ENDPOINT = process.env.OCR_WORKER_URL || 'http://localhost:4205/ocr';

function stripHtml(htmlString) {
  return htmlString
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarkdown(markdownString) {
  return markdownString
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function callOcrWorker(buffer, { languageHint } = {}) {
  if (!DEFAULT_OCR_ENDPOINT) {
    throw new Error('OCR endpoint is not configured');
  }

  const base64Data = buffer.toString('base64');
  const payload = {
    base64Data: `data:image/png;base64,${base64Data}`,
  };

  if (languageHint) {
    payload.languageHint = languageHint;
  }

  const response = await axios.post(DEFAULT_OCR_ENDPOINT, payload, {
    timeout: Number.parseInt(process.env.OCR_TIMEOUT_MS || '45000', 10),
  });

  return response.data;
}

async function extractFromPdf(buffer) {
  const result = await pdfParse(buffer);
  return {
    text: result.text?.trim() ?? '',
    metadata: {
      pageCount: result.numpages,
      info: result.info,
    },
  };
}

async function extractFromText(buffer, mimeType) {
  const raw = buffer.toString('utf-8');

  if (mimeType === 'text/html' || mimeType === 'application/xhtml+xml') {
    return { text: stripHtml(raw), metadata: { format: 'html' } };
  }

  if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
    return { text: stripMarkdown(raw), metadata: { format: 'markdown' } };
  }

  if (mimeType === 'application/json') {
    try {
      const parsed = JSON.parse(raw);
      return {
        text: JSON.stringify(parsed, null, 2),
        metadata: { format: 'json' },
      };
    } catch (error) {
      return { text: raw, metadata: { format: 'json', warning: 'Failed to parse JSON' } };
    }
  }

  return { text: raw.trim(), metadata: { format: 'plain' } };
}

async function extractFromImage(buffer, options) {
  const response = await callOcrWorker(buffer, options);
  return {
    text: response?.text?.trim() ?? '',
    metadata: {
      blocks: response?.blocks?.length,
      language: response?.language,
      confidence: response?.confidence,
      model: response?.model,
    },
  };
}

async function extractFromVideo(buffer, options) {
  if (options?.youtubeUrl) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(options.youtubeUrl);
      const text = transcript
        .map((entry) => entry.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        text,
        metadata: {
          source: 'youtube',
          segments: transcript.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch YouTube transcript: ${error.message}`);
    }
  }

  return {
    text: '',
    metadata: {
      warning: 'Video transcription requires a YouTube URL or external speech-to-text pipeline.',
      sizeBytes: buffer?.length ?? 0,
    },
  };
}

export async function extractTextFromUpload({ buffer, mimeType, originalName, options = {} }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided for extraction');
  }

  if (options.youtubeUrl) {
    return extractFromVideo(buffer, options);
  }

  if (SUPPORTED_PDF_TYPES.has(mimeType)) {
    return extractFromPdf(buffer);
  }

  if (SUPPORTED_TEXT_TYPES.has(mimeType)) {
    return extractFromText(buffer, mimeType);
  }

  if (SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    return extractFromImage(buffer, { languageHint: options.languageHint });
  }

  if (SUPPORTED_VIDEO_TYPES.has(mimeType) || options.youtubeUrl) {
    return extractFromVideo(buffer, options);
  }

  if (originalName?.toLowerCase().endsWith('.md')) {
    return extractFromText(buffer, 'text/markdown');
  }

  return {
    text: buffer.toString('utf-8').trim(),
    metadata: {
      warning: `Unhandled mimeType ${mimeType}. Processed as UTF-8 text fallback.`,
      originalName,
    },
  };
}

export async function extractTextFromUrl(url, options = {}) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: Number.parseInt(process.env.RAG_REMOTE_FETCH_TIMEOUT || '45000', 10),
  });

  const buffer = Buffer.from(response.data);
  const mimeType = response.headers['content-type'] || 'application/octet-stream';

  return extractTextFromUpload({
    buffer,
    mimeType,
    originalName: options.originalName || url.split('/').pop(),
    options,
  });
}

export function buildDocumentMetadata({
  extractionMetadata = {},
  uploadedBy,
  source,
  workspaceId,
  tags,
  knowledgeGraph,
}) {
  return {
    ...extractionMetadata,
    uploadedBy: uploadedBy || null,
    source,
    workspaceId,
    tags,
    knowledgeGraph,
    ingestedAt: new Date().toISOString(),
  };
}
