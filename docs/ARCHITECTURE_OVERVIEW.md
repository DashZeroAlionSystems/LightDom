# Architecture Overview — LightDom

This document summarizes the recommended architecture for the LightDom SEO Campaign product, describing components, data flows, and integrations needed to deliver the roadmap in `docs/PROJECT_ROADMAP.md`.

## Core Components

- Frontend (React + Vite)
  - Public landing page and marketing content
  - Signup/login and account management
  - Campaign creation wizard and campaign dashboard
  - Developer-friendly Storybook for UI components

- API Server (Node.js / Express)
  - Campaign CRUD, job orchestration endpoints, billing webhooks
  - Auth: JWT + refresh tokens; API key issuance for client-side instrumentation
  - Integrations: Ollama (for config generation), Stripe for billing

- Minimal Proxy (dev)
  - `minimal-api-server-proxy.js` for dev-time Ollama forwarding and file/PG persistence

- Crawler Workers
  - Headless extractor (Playwright or Puppeteer) packaged as a Docker worker
  - Job queue backed by Redis + BullMQ (or RabbitMQ)
  - Orchestrator to schedule and prioritize attribute mining tasks

- Database & Storage
  - Postgres for main relational data (campaigns, tasks, results)
  - pgvector extension for vector search (optional) or Pinecone/Weaviate for production
  - S3-compatible storage for raw page snapshots and artifacts

- ML Pipeline
  - Training datasets: `seo_training_data` table and raw artifacts in blob storage
  - Batch training jobs (Kubernetes CronJobs or scheduled containers)
  - Model registry (MLflow) and grading metrics
  - Model-serving endpoint for recommendations and uplift predictions

- Admin & Ops
  - Monitoring (Prometheus + Grafana), logging (ELK or hosted), and alerts
  - CI: GitHub Actions to run lint, unit tests, and build Docker images

## Data Flow (simplified)

1. User creates campaign via frontend → API persists campaign and generates a mining config (AI-assisted) → campaign saved in Postgres.
2. API enqueues tasks (seed URLs × attributes) into Redis queue.
3. Worker picks up a task, runs headless extractor against a URL, produces `analysis` object.
4. Worker calls `api/save` (internal API) or writes directly to Postgres: `seo_mining_results` and `seo_training_data`.
5. Periodic training job reads `seo_training_data` to produce models and stores model metadata in `ml_models` + MLflow.
6. Recommendations endpoint uses trained models to generate suggestions for pages.

## APIs (examples)

- POST /api/campaigns — create campaign (returns id)
- POST /api/campaigns/:id/start — start mining (enqueue jobs)
- GET /api/campaigns/:id/results — get aggregated campaign results
- POST /api/services/:id/start — (dev) start background service (protected)
- POST /api/install-snippet — generate an installable script snippet for a campaign (requires token and consent fields)

## Security & Multi-tenant Considerations

- Multi-tenancy: add `tenant_id` or `account_id` to most tables (campaigns, crawl results, training data).
- API Keys: store hashed keys in DB with scopes and expiry. Client script should use short-lived tokens or JWT obtained via server side.
- Data isolation: ensure each tenant's data is logically separated in the DB and that backups/exports respect tenant boundaries.

## Service Worker + PWA Injection Guidance

- Service workers are same-origin and require the site owner to run registration code on their origin. We cannot register an SW from a different origin.
- Recommended approach: provide a lightweight install snippet that site owners add to their pages (or a CMS plugin) that registers our service worker and a small client script. The snippet is per-tenant and includes the tenant's API key.
- The install flow should include:
  1. Display consent and feature toggles (analytics, behavior capture).
  2. Register our SW (script hosted on customer's domain or our CDN with CORS and correct scope).
  3. Open WebSocket or batched POST endpoint to stream anonymized events.

## Headless for SEO Testing (best practices)

- Use Playwright for robustness across browsers; it supports Chromium/Firefox/WebKit.
- For reliable Core Web Vitals in synthetic tests, run Lighthouse (via Puppeteer + Lighthouse or the Lighthouse CI) because raw Performance API in headless mode can vary.
- For large-scale crawling:
  - Use concurrency controls and site-specific rate limits.
  - Respect robots.txt and optionally consider robots meta pragma for indexing and polling.
  - Use browser contexts to isolate cookies and storage.

## Neural Network Scope & Training Data

- Data sources: per-page `features` JSON, `seo_score_before/after`, `effectiveness_score`, user behavior aggregates, conversion events.
- Labels: uplift in seo_score after applied optimization; business metrics if available (organic sessions, conversion rate).
- Initial model: tabular models (XGBoost/LightGBM) to predict expected uplift; later ensemble with neural networks for deeper interactions.
- Training cadence: weekly or after N new labeled changes; maintain a versioned dataset and evaluation holdout.

## Operational Recommendations

- Use Docker Compose for dev; Kubernetes (or managed container service) for production.
- Keep crawler workers stateless; use a durable queue and central storage for artifacts.
- Implement feature flags to enable/disable real-time behavior capture and service-worker based enhancements per tenant.
