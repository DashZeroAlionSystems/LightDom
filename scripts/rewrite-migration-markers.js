import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'database');

const files = fs.readdirSync(root).filter((file) => file.endsWith('.sql'));

const markerRegex = /INSERT INTO schema_migrations\(name\) VALUES \('([^']+)'\)\s*ON CONFLICT \(name\) DO NOTHING;?/gi;

for (const file of files) {
  const fullPath = path.join(root, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const updated = content.replace(markerRegex, (_match, name) => {
    return `INSERT INTO schema_migrations(filename)\nVALUES ('${name}.sql')\nON CONFLICT (filename) DO NOTHING;`;
  });

  if (updated !== content) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`Updated migration marker in ${file}`);
  }
}

console.log('Migration marker update complete.');
