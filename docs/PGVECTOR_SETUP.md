# pgvector setup for LightDom

This document describes how to enable and run the `pgvector` extension for PostgreSQL in this repository. The project includes migrations to enable the extension and to create an `embeddings` table used for RAG and similarity search.

Quick summary

- Build a Postgres image with `pgvector` compiled and installed (provided in `docker/pgvector/Dockerfile`).
- Run the container using the provided `docker/pgvector/docker-compose.yml` (maps host 5433 -> container 5432).
- Run migrations (the repo contains `migrations/0002_enable_pgvector.sql` and `migrations/0003_create_embeddings.sql`).

Build & run (Docker)

1. Build the custom Postgres image with pgvector

```powershell
cd docker/pgvector
docker compose build
docker compose up -d
```

2. Connect to the container and enable the extension (if not already enabled by the init scripts)

```powershell
docker exec -it postgres-pgvector psql -U postgres -d lightdom
# then in psql:
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

Run migrations

Use your normal migration tool to run the SQL files in `migrations/` (or run directly via psql):

```powershell
psql -h localhost -p 5433 -U postgres -d lightdom -f migrations/0002_enable_pgvector.sql
psql -h localhost -p 5433 -U postgres -d lightdom -f migrations/0003_create_embeddings.sql
```

Notes about indexing and performance

- The migration creates an `ivfflat` index using `vector_l2_ops`. Ivfflat is efficient for large collections but requires you to `ANALYZE` the table after bulk inserts to populate the index structures. Tune the `lists` parameter in the migration for your dataset.
- If your Postgres build or pgvector version does not support `ivfflat`, remove or adapt the index line.

Example usage (upserting an embedding)

The API expects the embedding vector to be supplied as an array of numbers. Example curl against the local API (once the app is running):

```bash
curl -X POST http://localhost:3001/api/embeddings/upsert \
  -H 'Content-Type: application/json' \
  -d '{"docId":"doc-1","namespace":"articles","content":"Text...","metadata":{"source":"web"},"embedding":[0.001,0.02, ...]}'
```

Example search (nearest neighbors)

```bash
curl -X POST http://localhost:3001/api/embeddings/search \
  -H 'Content-Type: application/json' \
  -d '{"embedding":[0.002,0.01,...],"namespace":"articles","topK":5}'
```

## Server-side embedding helper

If you prefer the server to generate embeddings on your behalf (instead of supplying them from the client), use the `upsert-from-text` endpoint which will request embeddings from an LLM provider (OpenAI) and upsert them into the DB:

```bash
curl -X POST http://localhost:3001/api/embeddings/upsert-from-text \
  -H 'Content-Type: application/json' \
  -d '{"docId":"doc-2","namespace":"articles","content":"Some long article text...","metadata":{"source":"web"}}'
```

This endpoint requires `OPENAI_API_KEY` to be set in your environment. The server uses the OpenAI embeddings endpoint (`text-embedding-3-small` by default) and will upsert the created vector into the `embeddings` table.

Server-side notes

- The repository includes a small `vector-store` service and example Express routes that allow upserting embeddings and performing similarity search using the `<->` operator.
- By default we declare vectors with dimension 1536 to match typical OpenAI embedding sizes (`text-embedding-3-small` / `text-embedding-3-large`). Adjust the migration and client usage if you use a different model/dimensions.

Security and production notes

- Never store secrets or production DB passwords in version control. Use environment variables or a secret manager.
- For production workloads, consider monitoring query and index performance, partitioning, and regular maintenance steps (VACUUM, ANALYZE).
