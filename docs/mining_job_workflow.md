# Mining Job Workflow (example)

This document explains how to configure and run a data-mining job to collect product data and training examples.

Example config fields

- startUrl: the URL to begin crawling (string)
- topic: human-friendly topic label (string)
- selectors: array of CSS selectors or schema.org itemtype selectors
- attributes: list of attributes to extract (e.g., name, price, image, sku, description)
- crawlDepth: integer (how deep to follow links)
- concurrency: worker concurrency
- needs_training_data: boolean — when true the pipeline will enqueue TF training jobs to enrich results
- frequency: optional cron-like schedule for recurring jobs

How the process runs (high level)

1. Create a mining job via the API `POST /api/mining-jobs/jobs` with a config described above.
2. The mining job will be executed by a worker which uses `crawler/headlessExtractor.js` to fetch pages and extract schemas.
3. Extracted product objects are normalized via `crawler/SEOCrawlerIntegration.js` and saved to `seo_training_data`.
4. If `needs_training_data` is set, the mining route will create or reuse a TensorFlow instance via `services/tf-singleton.js` and queue training.
5. Trained models are used to fill missing fields and generate richer product objects. Final stores are created by `services/commerce-bridge-service.js`.

Simulation (developer)

- Use `node scripts/enqueue_mining_job.js config/mining_job_example.json` to submit a job.
- Use `node scripts/start_mining_worker.js --url https://example.com/product-page --clientId demo` to run a single-run worker locally.
