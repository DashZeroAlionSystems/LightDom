/**
 * DeepSeek-OCR Service Tests
 * 
 * Comprehensive tests for DeepSeek-OCR integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DeepSeekOCRService from '../services/deepseek-ocr-service.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('DeepSeekOCRService', () => {
  let ocrService;
  
  beforeEach(() => {
    ocrService = new DeepSeekOCRService({
      ocrWorkerEndpoint: 'http://localhost:8000'
    });
    
    // Reset mock
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    ocrService.removeAllListeners();
  });
  
  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      const service = new DeepSeekOCRService();
      
      expect(service.config.ocrWorkerEndpoint).toBe('http://localhost:8000');
      expect(service.config.defaultCompressionRatio).toBe(0.1);
      expect(service.config.maxCompressionRatio).toBe(0.05);
      expect(service.config.targetVisionTokens).toBe(100);
      expect(service.config.minOcrPrecision).toBe(0.97);
    });
    
    it('should accept custom configuration', () => {
      const service = new DeepSeekOCRService({
        defaultCompressionRatio: 0.15,
        targetVisionTokens: 200,
        minOcrPrecision: 0.99
      });
      
      expect(service.config.defaultCompressionRatio).toBe(0.15);
      expect(service.config.targetVisionTokens).toBe(200);
      expect(service.config.minOcrPrecision).toBe(0.99);
    });
  });
  
  describe('Compression Ratio Calculation', () => {
    it('should calculate optimal compression ratio', () => {
      const input = {
        buffer: Buffer.alloc(8000) // 8KB buffer
      };
      
      const ratio = ocrService._calculateCompressionRatio(input, {
        targetTokens: 100
      });
      
      // 8000 bytes / 4 = 2000 tokens estimated
      // 100 / 2000 = 0.05
      expect(ratio).toBeGreaterThanOrEqual(0.05);
      expect(ratio).toBeLessThanOrEqual(0.1);
    });
    
    it('should clamp compression ratio to configured bounds', () => {
      const largeInput = {
        buffer: Buffer.alloc(1000000) // 1MB buffer
      };
      
      const ratio = ocrService._calculateCompressionRatio(largeInput, {
        targetTokens: 100
      });
      
      // Should clamp to maxCompressionRatio (0.05)
      expect(ratio).toBeGreaterThanOrEqual(0.05);
    });
  });
  
  describe('Document Processing', () => {
    it('should process document with URL input', async () => {
      const mockResponse = {
        data: {
          requestId: 'test-123',
          text: 'Extracted text',
          confidence: 0.98,
          language: 'en',
          model: 'deepseek-ocr',
          blocks: [
            { text: 'Extracted text', confidence: 0.98, bbox: null }
          ],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument({
        url: 'https://example.com/document.pdf'
      });
      
      expect(result.text).toBeTruthy();
      expect(result.metadata.confidence).toBe(0.98);
      expect(result.metadata.compressionRatio).toBeGreaterThan(0);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/ocr'),
        expect.objectContaining({
          fileUrl: 'https://example.com/document.pdf'
        }),
        expect.any(Object)
      );
    });
    
    it('should process document with base64 input', async () => {
      const mockResponse = {
        data: {
          requestId: 'test-456',
          text: 'Base64 text',
          confidence: 0.95,
          blocks: [],
          latencyMs: 150
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument({
        base64: 'data:image/png;base64,iVBORw0KGgo...'
      });
      
      expect(result.text).toBeTruthy();
      expect(result.metadata.confidence).toBe(0.95);
    });
    
    it('should process document with buffer input', async () => {
      const mockResponse = {
        data: {
          requestId: 'test-789',
          text: 'Buffer text',
          confidence: 0.97,
          blocks: [],
          latencyMs: 120
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument({
        buffer: Buffer.from('test image data')
      });
      
      expect(result.text).toBeTruthy();
      expect(result.metadata.confidence).toBe(0.97);
    });
    
    it('should maintain 97%+ precision at 10× compression', async () => {
      const mockResponse = {
        data: {
          requestId: 'test-precision',
          text: 'A'.repeat(1000), // 1000 chars
          confidence: 0.98,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/test.pdf' },
        { compressionRatio: 0.1 }
      );
      
      expect(result.metadata.confidence).toBeGreaterThan(0.97);
      expect(result.metadata.compressionRatio).toBeGreaterThan(9);
    });
    
    it('should emit document-processed event', async () => {
      const mockResponse = {
        data: {
          requestId: 'test-event',
          text: 'Event text',
          confidence: 0.95,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const eventPromise = new Promise(resolve => {
        ocrService.once('document-processed', resolve);
      });
      
      await ocrService.processDocument({
        url: 'https://example.com/document.pdf'
      });
      
      const event = await eventPromise;
      expect(event.requestId).toBe('test-event');
      expect(event.compressionRatio).toBeGreaterThan(0);
      expect(event.confidence).toBe(0.95);
    });
  });
  
  describe('Batch Processing', () => {
    it('should process multiple documents in batches', async () => {
      const mockResponse = {
        data: {
          requestId: 'batch-test',
          text: 'Batch text',
          confidence: 0.96,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const documents = [
        { url: 'https://example.com/doc1.pdf' },
        { url: 'https://example.com/doc2.pdf' },
        { url: 'https://example.com/doc3.pdf' }
      ];
      
      const results = await ocrService.processBatch(documents, {
        batchSize: 2
      });
      
      expect(results).toHaveLength(3);
      expect(axios.post).toHaveBeenCalledTimes(3);
    });
    
    it('should emit batch-completed events', async () => {
      const mockResponse = {
        data: {
          requestId: 'batch-event',
          text: 'Batch text',
          confidence: 0.95,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const events = [];
      ocrService.on('batch-completed', (event) => {
        events.push(event);
      });
      
      const documents = [
        { url: 'https://example.com/doc1.pdf' },
        { url: 'https://example.com/doc2.pdf' }
      ];
      
      await ocrService.processBatch(documents, { batchSize: 1 });
      
      expect(events).toHaveLength(2);
      expect(events[0].batchNumber).toBe(1);
      expect(events[1].batchNumber).toBe(2);
    });
  });
  
  describe('Output Formatting', () => {
    it('should format output as markdown', async () => {
      const mockResponse = {
        data: {
          requestId: 'md-test',
          text: 'Test text',
          confidence: 0.95,
          blocks: [
            { text: 'Paragraph 1', confidence: 0.95, bbox: null },
            { text: 'Paragraph 2', confidence: 0.96, bbox: null }
          ],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/test.pdf' },
        { outputFormat: 'markdown' }
      );
      
      expect(result.text).toContain('Paragraph 1');
      expect(result.text).toContain('Paragraph 2');
    });
    
    it('should format output as HTML', async () => {
      const mockResponse = {
        data: {
          requestId: 'html-test',
          text: 'HTML text',
          confidence: 0.95,
          blocks: [{ text: 'Test', confidence: 0.95, bbox: null }],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/test.pdf' },
        { outputFormat: 'html' }
      );
      
      expect(result.text).toContain('<!DOCTYPE html>');
      expect(result.text).toContain('<body>');
    });
    
    it('should format output as JSON', async () => {
      const mockResponse = {
        data: {
          requestId: 'json-test',
          text: 'JSON text',
          confidence: 0.95,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/test.pdf' },
        { outputFormat: 'json' }
      );
      
      const parsed = JSON.parse(result.text);
      expect(parsed).toHaveProperty('text');
      expect(parsed).toHaveProperty('blocks');
    });
  });
  
  describe('Statistics', () => {
    it('should track processing statistics', async () => {
      const mockResponse = {
        data: {
          requestId: 'stats-test',
          text: 'Stats text',
          confidence: 0.95,
          blocks: [],
          latencyMs: 100
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      // Process multiple documents
      await ocrService.processDocument({ url: 'https://example.com/doc1.pdf' });
      await ocrService.processDocument({ url: 'https://example.com/doc2.pdf' });
      
      const stats = ocrService.getStats();
      
      expect(stats.documentsProcessed).toBe(2);
      expect(stats.averageConfidence).toBeCloseTo(0.95, 2);
      expect(stats.averageCompressionRatio).toBeGreaterThan(0);
      expect(stats.averageProcessingTimeMs).toBeGreaterThan(0);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle OCR worker errors', async () => {
      axios.post.mockRejectedValue(new Error('Worker unavailable'));
      
      await expect(
        ocrService.processDocument({ url: 'https://example.com/test.pdf' })
      ).rejects.toThrow('DeepSeek-OCR processing failed');
    });
    
    it('should emit error events', async () => {
      axios.post.mockRejectedValue(new Error('Test error'));
      
      const errorPromise = new Promise(resolve => {
        ocrService.once('error', resolve);
      });
      
      try {
        await ocrService.processDocument({ url: 'https://example.com/test.pdf' });
      } catch (error) {
        // Expected
      }
      
      const errorEvent = await errorPromise;
      expect(errorEvent.message).toContain('Test error');
    });
  });
  
  describe('Health Check', () => {
    it('should check OCR worker health', async () => {
      axios.get.mockResolvedValue({
        data: {
          status: 'ok',
          mode: 'local',
          mock: true
        }
      });
      
      const health = await ocrService.healthCheck();
      
      expect(health.status).toBe('ok');
      expect(health.worker).toBeDefined();
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
    });
    
    it('should handle health check failures', async () => {
      axios.get.mockRejectedValue(new Error('Connection refused'));
      
      const health = await ocrService.healthCheck();
      
      expect(health.status).toBe('error');
      expect(health.error).toBeTruthy();
    });
  });
  
  describe('Compression Scenarios', () => {
    it('should achieve high compression for training data', async () => {
      const mockResponse = {
        data: {
          requestId: 'compression-test',
          text: 'A'.repeat(10000), // 10K chars
          confidence: 0.85,
          blocks: [],
          latencyMs: 150
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/training.pdf' },
        { compressionRatio: 0.05 } // 20× compression
      );
      
      expect(result.metadata.compressionRatio).toBeGreaterThan(15);
    });
    
    it('should maintain high precision for legal documents', async () => {
      const mockResponse = {
        data: {
          requestId: 'legal-test',
          text: 'Legal document text',
          confidence: 0.995,
          blocks: [],
          latencyMs: 200
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      const result = await ocrService.processDocument(
        { url: 'https://example.com/legal.pdf' },
        { compressionRatio: 0.15 } // 6-7× compression
      );
      
      expect(result.metadata.confidence).toBeGreaterThan(0.99);
    });
  });
});
