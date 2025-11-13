# Project Roadmap — LightDom SEO Campaign Product

## Purpose

This document defines a project plan to evolve LightDom from the current developer-friendly platform into a paywalled SaaS product that sells automated SEO campaigns. It focuses on the minimum work required to let customers sign up and run campaigns while continuing feature development in parallel.

## High-level Product Vision

- Offer an automated SEO Audit & Campaign product: create campaign, generate seed list, run headless crawls, extract 192+ SEO attributes, compute per-page SEO scores, generate actionable optimization recommendations, and provide scheduled re-crawls.
- Use AI (Ollama/DeepSeek) to generate configs and recommendations and a neural network to learn what changes drive measurable SEO gains.
- Provide a safe client install path (snippet or CMS plugin) that allows customers to instrument behavior and accept optimizations (PWA/service-worker options where appropriate).

## Delivery Phases & Timeline (estimate, assumes 2 engineers + 1 ML/devops part-time)

Phase 0 — Stabilize & Dev Environment (Week 0)

- Goals: stabilize repo, add dev docs, minimal proxy, extractors (done).
- Deliverables: `minimal-api-server-proxy.js`, `crawler/headlessExtractor.js`, database migrations for core tables, README updates.

Phase 1 — MVP (Weeks 1–4)

- Goals: make a public-facing landing page where users can sign up, create a campaign, and run a first audit (single-run). Provide a simple billing integration (Stripe) and free trial credits.
- Deliverables:
  - Landing page + signup/login + account management
  - Campaign creation wizard (prompt-assisted config generation)
  - Worker orchestration: Dockerized headless extractor + queue (Redis + BullMQ) orchestration: Dockerized hea
  - API endpoints: campaigns CRUD, start/stop campaign, campaign results
  - Dashboard page showing per-page SEO score and top suggestions
  - Basic payment flow (Stripe) and subscription model
  - Staging deployment (Docker Compose) and deployment guide

Phase 2 — Scale & Data Infrastructure (Weeks 4–8)

- Goals: make mining robust and scalable, introduce vector store and initial ML training pipeline.
- Deliverables:
  - pgvector or Pinecone integration for semantic search
  - Persisted crawl data, training data pipeline, S3-compatible blob storage for raw captures
  - Automated scheduled jobs and retry logic
  - Basic model training job (tabular model + evaluation) and model registry (MLflow)

Phase 3 — Recommendations & Automation (Weeks 8–16)

- Goals: deliver automated recommendations and begin closed-loop experiments.
- Deliverables:
  - Recommendations engine that maps feature deltas to suggested fixes
  - Automated patch generation for simple fixes (meta tags, structured data insertion snippets) with preview
  - A/B testing harness for showing collection of uplift data
  - Neural network training pipeline to predict impact; scheduled re-training

Phase 4 — Launch & Growth (Weeks 12–20)

- Goals: go to market, acquire early customers, optimize pricing and onboarding.
- Deliverables:
  - Production deployment (Kubernetes or managed containers)
  - Monitoring, logging, alerting, cost estimates
  - Documentation/Developer onboarding, public demo, marketing site + payment pages

## Acceptance Criteria for MVP

- A user can sign up, create a campaign, and run an audit that returns a per-page SEO score and a downloadable report.
- The system stores all campaign metadata, crawl results, and training records in Postgres.
- Billing is operational and subscriptions are enforced (trial or credits system).

## Team & Roles

- Full-stack developer: implement API routes, front-end campaign wizard, billing integration.
- DevOps/Infra: containerization, staging/production, database & storage setup.
- ML engineer (part-time): define data schema for training, implement initial model, set up model training scheduler.

## Estimate Summary

- MVP (usable for signups): 4 weeks
- Solid, scalable product with ML pipeline: 8–12 weeks

## Business Model & Pricing (suggestion)

- Free trial: 1 full site audit (up to 100 pages) or 7-day trial.
- Starter: $29/month — 500 pages crawled / month, weekly audits, standard reports.
- Growth: $149/month — 5,000 pages, daily audits, priority support.
- Enterprise: custom pricing — SLA, dedicated worker, white-glove onboarding.

## Security, Privacy & Legal

- All client instrumentation must be opt-in and respect privacy laws (GDPR/CCPA). Implement consent UI and anonymization.
- Service worker registration requires the client to include our installation script on their domain. We provide installers for popular CMS platforms to ease adoption.

## Next 7 Days (practical checklist)

1. Containerize headless extractor worker and create `docker-compose.yml` for Redis + Postgres + worker + API. (Start: NOW — Option B)
2. Implement campaign start/stop API using a job queue (BullMQ + Redis). Persist job records to `workflow_executions`.
3. Wire the worker to write `seo_mining_results` and `seo_training_data` to Postgres.
4. Add Stripe sandbox integration and simple signup flow.
5. Create a public-facing minimum landing page and signup form.

## Risks & Mitigations

- Crawling at scale may incur IP blocking — use respectful rate limits, distributed workers, user-agent rotation, and optional proxying.
- Service worker injection is limited by same-origin rules — provide installation scripts, CMS plugins, or small server-side helpers instead of remote SW injection.
- Data privacy risk — implement consent flows and store only aggregated/hashed user-behavior signals unless explicitly permitted.

## Where this ties to the neural network

- The ML pipeline will consume `seo_training_data` (features + before/after scores + effectiveness metrics) as the ground truth.
- Use a tabular model (XGBoost / LightGBM) first for feature importance and uplift prediction; later augment with a recommendation model (LLM + structured prompt) for textual suggestions.

## Documentation updates

- Add this roadmap to `/docs/PROJECT_ROADMAP.md` (this file).
- Update `MINING_SYSTEM_README.md` to include a short "How to get the MVP" section and provide a link to this roadmap.
