# Training & Data Mining Pipeline (Overview)

This document outlines the research & data-mining pipeline used to collect training data for
automated enrichment (neural models) and for generating production-grade assets (rich snippets,
product catalogs, etc.).

Goals

- Automate collection of high-quality training data for specific tasks (e.g., product attribute
  completion, price normalization, image-to-caption, category classification).
- Provide a repeatable mining job workflow that can be queued and run on demand.
- Wire extracted data to a TensorFlow instance (singleton per topic/bridge) that can be trained
  and used for inference to fill in missing product attributes.

Components

- Mining job queue: enqueue mining jobs (topic, startUrl, selectors, attributes) via `/api/mining-jobs`.
- Extractor: `crawler/headlessExtractor.js` extracts DOM, JSON-LD schemas, and backlinks.
- SEOCrawlerIntegration: normalizes attributes and persists `seo_training_data`.
- TF Singleton Manager: `services/tf-singleton.js` — creates and manages a model instance per topic.

How training data is collected

1. Mining job discovered product data and backlinks; structured data is normalized and persisted to `seo_training_data`.
2. Records flagged with missing or low-confidence fields are marked `needs_training_data`.
3. A TF training job (managed by the TF singleton) is created and queued to consume the dataset.
4. After training, model artifacts may be stored on disk or registered in DB metadata; inference jobs can run on new products.

For every "needs training data" request

- The miner will add a `needs_training_data` flag to the mining job response. The API and `mining-jobs.routes` will automatically enqueue a TF instance creation and training job to handle enrichment.

Storage & Vectorization

- When available, produce vector representations using the trained model or an embedding model and persist them to `pgvector` columns (requires Postgres with pgvector).

Notes on productionization

- Move heavy training workloads to separate GPU-backed workers and orchestrate via Kubernetes or container workers.
- Securely store model artifacts and avoid storing any PII in training datasets.
