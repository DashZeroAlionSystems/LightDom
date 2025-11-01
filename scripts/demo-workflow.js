#!/usr/bin/env node
// Demo script: create and run a workflow against a running LightDom API
// Usage: NODE_ENV=development node scripts/demo-workflow.js [baseUrl]

const fetch = globalThis.fetch || require('node-fetch');
const base = process.argv[2] || process.env.WORKFLOW_API_BASE || 'http://localhost:3000';

async function main() {
  const createResp = await fetch(`${base}/api/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'demo_workflow', name: 'Demo Workflow', steps: [{ type: 'log', message: 'hello' }, { type: 'delay', ms: 100 }] })
  });
  const created = await createResp.json();
  console.log('create:', created);

  const runResp = await fetch(`${base}/api/workflows/demo_workflow/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: { demo: true } }) });
  const runResult = await runResp.json();
  console.log('run:', runResult);

  const suggestionsResp = await fetch(`${base}/api/workflows/suggestions`);
  const suggestions = await suggestionsResp.json();
  console.log('suggestions:', suggestions);
}

main().catch((e) => {
  console.error('demo failed', e && e.stack ? e.stack : e);
  process.exit(1);
});
