/**
 * Bidirectional Streaming Integration Tests
 * Tests for WebSocket and HTTP streaming communication
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import WebSocket from 'ws';
import axios from 'axios';

const WS_URL = 'ws://localhost:3001';
const API_URL = 'http://localhost:3001/api/ollama';

describe('Bidirectional Streaming', () => {
  describe('WebSocket Streaming', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(WS_URL);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    }, 10000);

    it('should receive streaming chunks', (done) => {
      const ws = new WebSocket(WS_URL);
      const chunks: string[] = [];

      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            message: 'Tell me about portfolio optimization',
          })
        );
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'chunk') {
            chunks.push(message.content);
          }

          if (message.type === 'complete') {
            expect(chunks.length).toBeGreaterThan(0);
            ws.close();
            done();
          }
        } catch (error) {
          done(error);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        ws.close();
        if (chunks.length > 0) {
          done();
        } else {
          done(new Error('No chunks received'));
        }
      }, 30000);
    }, 35000);

    it('should handle tool calls in streaming', (done) => {
      const ws = new WebSocket(WS_URL);
      let toolCalled = false;

      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            message: 'Create a simple workflow',
            tools: true,
          })
        );
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'tool_call') {
            toolCalled = true;
            expect(message.tool).toHaveProperty('name');
            expect(message.tool).toHaveProperty('arguments');
          }

          if (message.type === 'complete') {
            ws.close();
            done();
          }
        } catch (error) {
          done(error);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });

      setTimeout(() => {
        ws.close();
        done();
      }, 30000);
    }, 35000);

    it('should support bidirectional conversation', (done) => {
      const ws = new WebSocket(WS_URL);
      let firstComplete = false;

      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            message: 'Hello',
          })
        );
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'complete' && !firstComplete) {
            firstComplete = true;
            // Send follow-up message
            ws.send(
              JSON.stringify({
                type: 'send',
                message: 'Create a workflow',
              })
            );
          } else if (message.type === 'complete' && firstComplete) {
            ws.close();
            done();
          }
        } catch (error) {
          done(error);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });

      setTimeout(() => {
        ws.close();
        done(new Error('Timeout waiting for bidirectional conversation'));
      }, 60000);
    }, 65000);
  });

  describe('HTTP Streaming', () => {
    it('should start streaming session', async () => {
      const response = await axios.post(`${API_URL}/stream/start`, {
        message: 'Hello from HTTP streaming',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('streamId');
      expect(response.data).toHaveProperty('status');
    }, 10000);

    it('should send message to active stream', async () => {
      // Start stream
      const startResponse = await axios.post(`${API_URL}/stream/start`, {
        message: 'Initial message',
      });

      const streamId = startResponse.data.streamId;

      // Send follow-up
      const sendResponse = await axios.post(`${API_URL}/stream/send`, {
        streamId,
        message: 'Follow-up message',
      });

      expect(sendResponse.status).toBe(200);
    }, 15000);

    it('should stop streaming session', async () => {
      // Start stream
      const startResponse = await axios.post(`${API_URL}/stream/start`, {
        message: 'Test message',
      });

      const streamId = startResponse.data.streamId;

      // Stop stream
      const stopResponse = await axios.post(`${API_URL}/stream/stop`, {
        streamId,
      });

      expect(stopResponse.status).toBe(200);
    }, 10000);
  });

  describe('Conversation Management', () => {
    it('should retrieve conversation history', async () => {
      // Create conversation
      const chatResponse = await axios.post(`${API_URL}/chat`, {
        message: 'Test message',
      });

      const conversationId = chatResponse.data.conversationId;

      // Get history
      const historyResponse = await axios.get(`${API_URL}/conversation/${conversationId}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.data).toHaveProperty('messages');
      expect(Array.isArray(historyResponse.data.messages)).toBe(true);
    }, 10000);

    it('should clear conversation', async () => {
      // Create conversation
      const chatResponse = await axios.post(`${API_URL}/chat`, {
        message: 'Test message',
      });

      const conversationId = chatResponse.data.conversationId;

      // Clear conversation
      const deleteResponse = await axios.delete(`${API_URL}/conversation/${conversationId}`);

      expect(deleteResponse.status).toBe(200);
    }, 10000);
  });
});
