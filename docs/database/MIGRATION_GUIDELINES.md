# Database Migration Guidelines

This guide standardises how we create, review, and execute database migrations across LightDom. The goals are:

- keep the `dom_space_harvester` schema consistent across developers and CI
- make pending migrations obvious before runtime failures happen
- ensure every migration file can be re-run safely (`idempotent`) when orchestration scripts retry

## Directory Layout

- `migrations/` – primary location for hand-written SQL that the automation runners execute. Use this directory for all new migrations.
- `database/migrations/` – legacy and large subsystem bootstrap scripts. Only touch these if you are extending an existing module that already lives there.

## Everyday Workflow

1. **Check status first**

   ```pwsh
   node scripts/run-all-migrations.js status
   ```

   Shows executed vs pending migrations using the shared `schema_migrations` ledger.

2. **Inspect details when needed**

   ```pwsh
   node scripts/run-all-migrations.js list
   ```

   Lists every migration with execution timestamps and flags failures (✅/❌/⏳).

3. **Apply outstanding migrations**

   ```pwsh
   node scripts/run-all-migrations.js migrate
   ```

   Runs pending files alphabetically, records duration + success flag, and tolerates "already exists" errors.

4. **Fallback CLI alias** – `npm run db:migrate` still works and delegates to the SQL runner (`scripts/migrate.js`) for compatibility, but `run-all-migrations.js` is the recommended entry point because it prints a richer status report and now works on Windows after the path normalisation fix.

## Adding a New Migration

- **Name** – `/migrations/YYYYMMDD_description.sql` or `/migrations/<sequence>_<slug>.sql`. Keep names ASCII, lower-case, and descriptive.
- **Header comment** – include a short description, purpose, and creation date at the top of the file.
- **Idempotency** – wrap structural changes with `IF [NOT] EXISTS` guards, or use pattern checks (`information_schema`) before `ALTER` / `INSERT`. Every script must be safe to rerun.
- **Deterministic identifiers** – when you need a stable UUID, prefer `uuid_generate_v5(<namespace>, '<slug>')`. Fall back to `gen_random_uuid()` (from `pgcrypto`) only when the value is expected to be unique per run.
- **Transactional safety** – the runner wraps each migration in a transaction. Avoid explicit `BEGIN` / `COMMIT` inside the file unless you know it must break the outer transaction.
- **Diagnostics** – add `RAISE NOTICE '...';` at the end so operators can confirm success in server logs.
- **Dependencies** – if your migration relies on objects from another file, add a comment referencing the prerequisite and guard with existence checks so local developers without the dependency do not get hard failures.

## Post-merge Checklist

- After merging a PR with migrations, run `node scripts/run-all-migrations.js status` locally to confirm no new pendings slipped in.
- Update application docs or READMEs when the schema change affects API payloads, data loaders, or orchestrator defaults.
- If the migration seeds data, include verification queries in the PR description (e.g., `SELECT COUNT(*) FROM ...` to confirm rows).

## Automation Notes

- `scripts/run-all-migrations.js` now normalises `process.argv` with `pathToFileURL`, so it autodetects direct invocation on Windows (`node scripts\run-all-migrations.js status`).
- The runner records per-migration timings in `schema_migrations.execution_time_ms`; use `list` to surface slow steps.
- CI environments can run `node scripts/run-all-migrations.js migrate --` (no flags needed) to guarantee schema freshness before tests.

## Troubleshooting

| Symptom                              | Recommended Action                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `column "..." does not exist`        | Double-check the migration order; add `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` or ensure the prerequisite migration ran successfully. |
| `relation "..." does not exist`      | Wrap the `ALTER`/`CREATE INDEX` in an `IF EXISTS` table guard so empty databases can bootstrap cleanly.                                     |
| `invalid input syntax for type uuid` | Use deterministic UUID helpers or cast text identifiers to the correct type before insert/update.                                           |
| Migration marked ❌ in `list`        | Fix the SQL file, then rerun `node scripts/run-all-migrations.js migrate`. The runner updates the status row on success.                    |

Keeping to these guidelines ensures every engineer (and the orchestrators) can bootstrap the database confidently across Linux, macOS, and Windows.
