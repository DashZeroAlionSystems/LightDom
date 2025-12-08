import WebSocket from 'ws';
import { getEvents } from '../../orchestrator/src/index.js';

const server = new WebSocket.Server({ port: 9620 });
const clients = new Set<WebSocket>();

server.on('connection', socket => {
  clients.add(socket);
  socket.on('close', () => clients.delete(socket));
});

function broadcast(message: unknown): void {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

const events = getEvents();

events.crawler.on('progress', event => {
  broadcast({ channel: 'crawler.progress', event });
});

events.classifier.on('completed', event => {
  broadcast({ channel: 'classifier.completed', event });
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
