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
  const { rows } = await client.query('SELECT id, filename, executed_at FROM schema_migrations ORDER BY id');
  console.table(rows);
  await client.end();
}

main().catch((error) => {
  console.error('Failed to read schema_migrations:', error);
  process.exit(1);
});
