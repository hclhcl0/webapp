import fs from 'fs';
import { execSync } from 'child_process';

const env = fs.readFileSync('.env', 'utf8');
const dbUriMatch = env.match(/DATABASE_URI="([^"]+)"/);

if (dbUriMatch) {
  process.env.DATABASE_URI = dbUriMatch[1];
  console.log('Found DATABASE_URI:', process.env.DATABASE_URI);
  import('./migrate.mjs').catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
} else {
  console.error('Could not find DATABASE_URI in .env');
  process.exit(1);
}
