#!/usr/bin/env node
// Simple CLI to enqueue a list of URLs to the queue API
const API_URL = process.env.API_URL || process.env.QUEUE_API_URL || 'http://localhost:3053';
const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['https://example.com', 'https://www.iana.org'];

(async function main() {
  for (const u of urls) {
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      });
      const j = await res.json();
      console.log('Enqueued', u, '->', j);
    } catch (err) {
      console.error('Failed to enqueue', u, err && err.message ? err.message : err);
    }
  }
})();
