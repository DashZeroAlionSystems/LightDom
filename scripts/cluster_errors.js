const fs = require('fs');
const path = require('path');
const logPath = path.join(process.cwd(),'type-check.log');
const outPath = path.join(process.cwd(),'type-check-clusters.json');
if (!fs.existsSync(logPath)) {
  console.error('type-check.log not found in', process.cwd());
  process.exit(2);
}
const text = fs.readFileSync(logPath,'utf8');
const lines = text.split(/\r?\n/);
const regex = /^(.+?):(\d+):(\d+) - error (TS\d+):\s*(.*)$/;
const clusters = Object.create(null);
for (let i=0;i<lines.length;i++) {
  const line = lines[i];
  const m = line.match(regex);
  if (m) {
    const file = m[1];
    const lineNum = Number(m[2]);
    const col = Number(m[3]);
    const code = m[4];
    const msg = m[5].trim();
    // Normalize message a bit: collapse spaces
    const normalized = msg.replace(/\s+/g,' ').trim();
    const key = `${code} | ${normalized}`;
    if (!clusters[key]) {
      clusters[key] = { key, code, message: normalized, count: 0, sample: { file, line: lineNum, col } };
    }
    clusters[key].count++;
  }
}
const arr = Object.values(clusters).sort((a,b)=>b.count-a.count);
const top = arr.slice(0,200);
fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), totalClusters: arr.length, top }, null, 2));
console.log('Wrote', outPath, 'clusters:', top.length);
for (let i=0;i<Math.min(50, top.length); i++) {
  const c = top[i];
  console.log(`#${i+1}: (${c.count}) ${c.code} - ${c.message} -- sample: ${c.sample.file}:${c.sample.line}`);
}
