#!/usr/bin/env node
// Metrics Collection Script

const os = require('os');
const fs = require('fs');

console.log('📊 Collecting system metrics...');

// CPU usage
const cpuUsage = process.cpuUsage();
const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000;
console.log(`cpu_usage_percent ${cpuPercent}`);

// Memory usage
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memoryPercent = (usedMem / totalMem) * 100;
console.log(`memory_usage_percent ${memoryPercent.toFixed(2)}`);

// Disk usage (simplified)
const diskUsage = 50; // Mock value
console.log(`disk_usage_percent ${diskUsage}`);

// Network I/O (simplified)
const networkInterfaces = os.networkInterfaces();
let networkRx = 0;
let networkTx = 0;

for (const [name, interfaces] of Object.entries(networkInterfaces)) {
  for (const iface of interfaces) {
    if (!iface.internal) {
      networkRx += Math.random() * 1000000; // Mock values
      networkTx += Math.random() * 1000000;
    }
  }
}

console.log(`network_rx_bytes ${networkRx}`);
console.log(`network_tx_bytes ${networkTx}`);

console.log('✅ Metrics collected');
