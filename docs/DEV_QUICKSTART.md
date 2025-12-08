# Dev quickstart — Queue + DB bootstrap

This file documents the recommended quickstart for local development of the queue/worker/SEO crawler components.

1. Start Redis + Postgres (recommended if you have Docker):

```powershell
# from repository root
docker compose -f docker-compose.dev.yml up -d postgres-dev redis
```

2. (Optional) Run the one-shot DB bootstrap container which will install node deps
   and run the bootstrap script once Postgres is available:

```powershell
docker compose -f docker-compose.dev.yml run --rm db-bootstrap
```

3. Start the queue service (detached so it survives parent editor/terminal signals):

```powershell
$# spawn detached via helper (recommended when running from editors)
node scripts/run_queue_detached.js

# OR start in foreground for logs
$env:QUEUE_API_PORT='3060'
node services/queue-service.js
```

4. Enqueue a sample URL for testing:

```powershell
$env:API_URL='http://localhost:3060'
node scripts/enqueue_sample.js https://example.com
```

5. Verify DB rows were created (if DB accessible):

```powershell
node scripts/db_check_seo_counts.js
```

Notes:

- If you don't have Docker available, you can run Postgres locally and then run `npm run db:bootstrap` to create the minimal dev tables.
- The `db-bootstrap` compose service will run `npm ci` inside a container; this may take a few minutes the first time.
