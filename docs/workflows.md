# Workflows & Self-Learning Automation (LightDom)

This doc explains the small workflow scaffold and self-learning agent added to the repo.

Files added
- `src/services/workflow/WorkflowService.ts` — simple in-memory workflow registry with disk persistence (`.workflows.json`). Safe built-in step types: `log`, `delay`, `noop`.
- `src/services/ai/SelfLearningAgent.ts` — tiny execution recorder and heuristic suggester. Observes workflow runs and suggests candidates for automation.
- `src/api/workflows.ts` — lightweight Express router showing how to create/list/run workflows and query suggestions.

Usage (quick)

1) Mount the router in your Express app (example in `api-server-express.js`):

```js
const workflowsRouter = require('./src/api/workflows').default;
app.use('/api', workflowsRouter);
```

2) Create a workflow

POST /api/workflows
body: { id: 'daily-summary', name: 'Daily summary', steps: [{ type:'log', message: 'Starting' }, { type:'delay', ms: 200 }, { type:'log', message: 'Done' }] }

3) Run the workflow

POST /api/workflows/daily-summary/run
response will include run results and duration. Runs are recorded by the SelfLearningAgent.

4) See suggestions

GET /api/workflows/suggestions

Next steps and extension ideas
- Add step handlers for HTTP requests, shell scripts (careful!), or internal service calls.
- Add authentication and RBAC for workflow creation/run.
- Improve the learning agent: cluster sequences, build ML models, or integrate with an offline analytics pipeline.
- Add tests (Vitest) that create workflows, run them, and assert results and persisted files.

Notes
- This is intentionally conservative: no arbitrary code execution. Use it as a scaffold and extend carefully.
