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
// Support both formats:
// 1) file.ts(x):(line,col): error TS1234: message
// 2) file.ts:line:col - error TS1234: message
const regex1 = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.*)$/; // file(line,col): error TS
const regex2 = /^(.+?):(\d+):(\d+)\s*-\s*error\s+(TS\d+):\s*(.*)$/; // file:line:col - error TS
const clusters = Object.create(null);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m = line.match(regex1) || line.match(regex2);
  if (m) {
    // Determine which regex matched and normalize groups
    let file, lineNum, col, code, msg;
    if (m.length >= 6 && m[2] && m[3]) {
      file = m[1];
      lineNum = Number(m[2]);
      col = Number(m[3]);
      code = m[4];
      msg = m[5] || '';
    } else {
      // fallback - use best-effort
      file = m[1] || 'unknown';
      lineNum = Number(m[2] || 0);
      col = Number(m[3] || 0);
      code = m[4] || 'TS0000';
      msg = m[5] || '';
    }

    // capture multi-line message body that follows until the next error header or blank line
    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j];
      if (!next || next.trim() === '') break;
      if (regex1.test(next) || regex2.test(next)) break;
      // append additional detail lines
      msg += ' ' + next.trim();
      j++;
    }
    // advance index to skip the consumed lines
    if (j > i + 1) i = j - 1;

    const normalized = msg.replace(/\s+/g, ' ').trim();
    const key = `${code} | ${normalized}`;
    if (!clusters[key]) {
      clusters[key] = { key, code, message: normalized, count: 0, sample: { file, line: lineNum, col } };
    }
    clusters[key].count++;
  }
}

const arr = Object.values(clusters).sort((a, b) => b.count - a.count);
const top = arr.slice(0, 200);
fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), totalClusters: arr.length, top }, null, 2));
console.log('Wrote', outPath, 'clusters:', top.length);
for (let k = 0; k < Math.min(50, top.length); k++) {
  const c = top[k];
  console.log(`#${k + 1}: (${c.count}) ${c.code} - ${c.message} -- sample: ${c.sample.file}:${c.sample.line}`);
}
