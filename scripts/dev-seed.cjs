const fs = require('fs');
const path = require('path');

// Paths
const root = path.resolve(__dirname, '..');
const frontendExamples = path.join(root, 'frontend', 'src', 'config', 'examples');
const publicDir = path.join(root, 'frontend', 'public');
const outFile = path.join(publicDir, 'dev-seed.json');

function readJson(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

function seed() {
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const copilot = readJson(path.join(frontendExamples, 'copilot-console.example.json')) || {};
  const announce = readJson(path.join(frontendExamples, 'announce-modal.example.json')) || {};
  const workflow = readJson(path.join(frontendExamples, 'workflow-wizard.example.json')) || {};

  const combined = { copilot, announce, workflow, seededAt: new Date().toISOString() };

  fs.writeFileSync(outFile, JSON.stringify(combined, null, 2));
  console.log('Dev seed written to', outFile);
}

seed();
