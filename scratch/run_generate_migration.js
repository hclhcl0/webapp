import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';
import { generateMigration } from '@payloadcms/db-postgres';

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  await payload.db.generateMigration();
  
  console.log("Migration generated successfully.");
  process.exit(0);
}

run().catch(console.error);
