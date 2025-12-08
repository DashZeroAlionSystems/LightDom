---
description: phased plan to modularize the API server into services, routes, middleware, and TypeScript wrappers
---
1. **Assessment & Snapshot**
   - Confirm a clean git status or stash pending work.
   - Run `npm run api` and capture current failures for baseline.
   - Inventory existing route blocks inside `api-server-express.js` (crawler, blockchain, admin, etc.) and note shared dependencies.

2. **Project Scaffolding**
   - Create directories `src/api/middleware`, `src/api/routes`, `src/api/controllers`, `src/services`, `src/types`, and `src/utils` (adjust if `src` is nested differently).
   - Add placeholder `index.ts` files exporting no-op functions for middleware, websocket, and a sample route to keep builds passing.
   - Update `tsconfig.json` (or create one) to include new folders and enable ESM-compatible output.

3. **Core Extraction Loop (per domain)**
   - Pick one logical domain (e.g., crawler) and move its Express handlers into `routes/<domain>/index.ts`, introducing a controller + service pair if business logic is non-trivial.
   - Pass dependencies (db, io, feature flags) through typed factory functions defined in `types/api.ts`.
   - Replace the original inline block in `api-server-express.js` with `app.use('/api/<domain>', setup<Domain>Routes(deps));`.
   - Repeat for each domain, committing after every two domains to keep diffs reviewable.

4. **Middleware & WebSocket Modularization**
   - Move middleware stack (helmet, compression, logging, rate limiting) into `api/middleware/index.ts` and call it from the server constructor.
   - Extract websocket listeners into `api/websocket/index.ts`, injecting only the services they require.

5. **Service Initialization Pass**
   - Create service classes under `src/services` encapsulating shared state (crawler system, blockchain clients, template watcher, etc.).
   - Initialize them in the server constructor via a `ServiceDependencies` object, and expose typed getters to route modules.
   - Ensure optional services guard on feature flags so missing modules no longer crash startup.

6. **Type Safety & Config**
   - Introduce `AppConfig` + `ServiceDependencies` interfaces in `src/types/api.ts` and centralize environment parsing in `src/utils/config.ts`.
   - Replace magic strings for feature toggles with typed config lookups.

7. **Validation & Testing**
   - Run `npm run api` after each extraction to ensure no regression in WebSocket startup and that `/api/health` responds.
   - Add smoke tests or `supertest` checks for critical routes if the test suite exists.

8. **Cleanup & Documentation**
   - Remove leftover dead code from `api-server-express.js` once all domains are migrated; rename the file to `src/api/server.ts` if desired.
   - Update README/onboarding docs to describe the new folder layout and dependency injection pattern.
   - Capture follow-up tasks (TS conversion gaps, linting, automated tests) as TODOs or tickets.
