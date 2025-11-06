#!/usr/bin/env node

// Lightweight Ticket Queue API to rate-limit Linear issue creation
// POST /api/tickets/enqueue { title, description, priority, teamId }
// GET  /api/tickets/status

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON parsing error:', error.message);
    return res.status(400).json({ ok: false, error: 'Invalid JSON format' });
  }
  next();
});

const PORT = Number(process.env.TICKET_QUEUE_PORT || 3099);
const MAX_PER_HOUR = Number(process.env.TICKET_QUEUE_MAX_PER_HOUR || 10);
const MIN_INTERVAL_MS = Number(process.env.TICKET_QUEUE_MIN_INTERVAL_MS || 60_000);

// In-memory queue and state
const queue = [];
const createdTimestamps = []; // epoch ms
const dedupeSet = new Set(); // hashes of recent titles+desc
let lastCreatedAt = 0;
let processedCount = 0;
let lastError = null;

function pruneOld() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  while (createdTimestamps.length && createdTimestamps[0] < oneHourAgo) {
    createdTimestamps.shift();
  }
  // Keep dedupe window to last 500 items
  if (dedupeSet.size > 500) {
    // Reset occasionally to bound memory; acceptable for ephemeral queue
    dedupeSet.clear();
  }
}

function hashTicket(t) {
  const h = crypto.createHash('sha256');
  h.update((t.title || '').toLowerCase());
  h.update('|');
  h.update((t.description || '').toLowerCase());
  return h.digest('hex').slice(0, 16);
}

app.post('/api/tickets/enqueue', (req, res) => {
  const { title, description, priority = 'Medium', teamId = null } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ ok: false, error: 'title required' });
  }
  const ticket = { title, description: description || '', priority, teamId };
  const key = hashTicket(ticket);
  if (dedupeSet.has(key)) {
    return res.status(200).json({ ok: true, deduped: true });
  }
  dedupeSet.add(key);
  queue.push(ticket);
  return res.json({ ok: true, queued: true, size: queue.length });
});

app.get('/api/tickets/status', (_req, res) => {
  pruneOld();
  res.json({
    ok: true,
    queueSize: queue.length,
    createdLastHour: createdTimestamps.length,
    lastCreatedAt,
    processedCount,
    lastError,
    needsLinearKey: !process.env.LINEAR_API_KEY,
    rate: { MAX_PER_HOUR, MIN_INTERVAL_MS }
  });
});

// Debug endpoint (summary only, not full descriptions)
app.get('/api/tickets/debug', (_req, res) => {
  res.json({
    ok: true,
    queuePreview: queue.slice(0, 10).map(t => ({ title: t.title, priority: t.priority })),
    processedCount,
    lastError
  });
});

async function processQueue() {
  pruneOld();
  const now = Date.now();
  if (!queue.length) return;
  if (createdTimestamps.length >= MAX_PER_HOUR) return;
  if (now - lastCreatedAt < MIN_INTERVAL_MS) return;

  const ticket = queue.shift();

  try {
    // Lazy import Linear SDK to avoid cost when idle
    const { LinearClient } = await import('@linear/sdk');
    
    // Try to get API key from environment or file
    let apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      try {
        apiKey = fs.readFileSync('linear-api-key.txt', 'utf8').trim();
      } catch (e) {
        // File doesn't exist, continue with undefined
      }
    }
    
    if (!apiKey) {
      throw new Error('LINEAR_API_KEY not set');
    }
    const client = new LinearClient({ apiKey });

    let teamId = ticket.teamId;
    if (!teamId) {
      const teams = await client.teams();
      teamId = teams.nodes[0]?.id;
    }

    // Map priority to Linear's numeric values
    const priorityMap = {
      'low': 0,
      'medium': 1,
      'high': 2,
      'urgent': 3,
      'critical': 4
    };
    
    const priorityValue = priorityMap[String(ticket.priority || 'medium').toLowerCase()] || 1;
    
    // Get or create labels
    const labels = await client.issueLabels({ first: 100 });
    const automationLabel = labels.nodes.find(l => l.name === 'automation');
    const lightdomLabel = labels.nodes.find(l => l.name === 'lightdom');
    
    const labelIds = [];
    if (automationLabel) labelIds.push(automationLabel.id);
    if (lightdomLabel) labelIds.push(lightdomLabel.id);
    
    await client.createIssue({
      teamId,
      title: ticket.title,
      description: ticket.description,
      priority: priorityValue,
      labelIds: labelIds
    });

    lastCreatedAt = Date.now();
    createdTimestamps.push(lastCreatedAt);
    processedCount++;
    // Success logged to stdout for observability
    console.log(`[TicketQueue] Created Linear issue: ${ticket.title}`);
    lastError = null;
  } catch (e) {
    // On failure, push back to end of queue for retry later
    console.error(`[TicketQueue] Failed to create issue: ${e.message}`);
    lastError = e.message;
    queue.push(ticket);
  }
}

setInterval(processQueue, 5_000);

app.listen(PORT, () => {
  console.log(`Ticket Queue API listening on http://localhost:${PORT}`);
});


