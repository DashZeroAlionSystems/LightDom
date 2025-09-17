import { vi } from 'vitest';

// Mock global objects
global.fetch = vi.fn();
// Keep console methods for debugging
// global.console = {
//   ...console,
//   // Suppress console logs during tests unless explicitly enabled
//   log: vi.fn(),
//   warn: vi.fn(),
//   error: vi.fn(),
//   info: vi.fn(),
//   debug: vi.fn()
// };

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}));

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3001';
process.env.REACT_APP_WS_URL = 'ws://localhost:3001';

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
