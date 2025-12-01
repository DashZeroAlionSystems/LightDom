# Bridges (Commerce & Chat) — LightDom

This document describes the purpose and design of _bridges_ in LightDom. "Bridges" are adapters
that connect mined web content (product pages, backlinks, DOM snippets) to application-level
features: chat interfaces, auto-generated stores, backlink stores, and monetization flows.

Core ideas

- Bridge: logical object connecting a source (website, client) to a target (chat, store, payment)
- Auto-store: a store generated from discovered product schemas and backlinks on a client's site
- Rich snippets: JSON-LD schema.org markup generated for discovered products so search engines and
  clients can render product cards and 'see more' -> 'add to cart' flows
- Training data: whenever we discover product data that has missing fields, we flag it as
  `needs_training_data` and queue it into the training pipeline so a TF model can help fill in
  missing values automatically.

Security & privacy considerations

- Respect robots.txt and site terms when crawling and mining.
- Do not persist or present payment information unless explicit consent is given by the client.
- Be careful with automated product creation for third-party sites — always obtain authorization.

Integration points

- Extraction: `crawler/headlessExtractor.js` and `crawler/SEOCrawlerIntegration.js` produce
  structured schema data and backlink graphs.
- Storage: store bridges and stores in Postgres (`dimensional_bridges` and `commerce_stores`).
- Payments: integrate with Stripe/other providers via `api/payment-routes.js` and store
  gateway tokens in secure storage.
- ML: training data produced by the mining process is routed to the TF singleton manager
  via the training-data pipeline (see `docs/TRAINING_DATA_PIPELINE.md`).

Auto-store flow (high-level)

1. Client registers a bridge (manual or via onboarding).
2. Submit a mining job targeting the client's site or a topic (see `config/mining_job_example.json`).
3. Miner discovers product schemas and backlinks and calls the Bridge Service to generate an auto-store.
4. Bridge Service generates JSON-LD rich snippets for each product and stores them.
5. Products visible in the client single-list view include 'See more' -> product detail -> 'Add to cart' -> Checkout.
6. If product data is incomplete, it's flagged as `needs_training_data` and a TF training job is scheduled.

Developer notes

- Services to look at:
  - `services/commerce-bridge-service.js` — bridge & auto-store management
  - `services/commerce-bridge-miner.js` — extraction & auto-store creation helper
  - `services/tf-singleton.js` — TF manager to run/train models per topic/bridge
  - `services/deepseek-ollama-adapter.js` — generate mining configs and prompts for DeepSeek/Ollama

See also: `docs/mining_job_workflow.md` and `docs/TRAINING_DATA_PIPELINE.md` for workflow and pipeline details.
