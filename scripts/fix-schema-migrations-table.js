import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  await client.connect();

  await client.query('ALTER TABLE schema_migrations DROP COLUMN IF EXISTS name CASCADE');

  await client.query('ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS filename VARCHAR(255)');
  await client.query("ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

  await client.query("UPDATE schema_migrations SET filename = CONCAT('migration_', id) WHERE filename IS NULL");

  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS schema_migrations_filename_key ON schema_migrations(filename)');

  await client.query(
    "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
    ['001_initial_schema.sql']
  );

  console.log('schema_migrations table adjusted.');
  await client.end();
}

main().catch((error) => {
  console.error('Failed to adjust schema_migrations table:', error);
  process.exit(1);
});
