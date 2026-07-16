import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Vaccines } from './src/collections/Vaccines.ts';
import { SiteSettings } from './src/globals/SiteSettings.ts';

// Tạo 1 config nhỏ chỉ chứa các model mới
const config = buildConfig({
  secret: 'dummy',
  db: postgresAdapter({
    pool: { connectionString: 'postgres://dummy:dummy@localhost:5432/dummy' },
  }),
  editor: lexicalEditor(),
  collections: [Vaccines],
  globals: [SiteSettings],
});

async function main() {
  const resolvedConfig = await config;
  const db = resolvedConfig.db;
  // Initialize db
  await db.init({ payload: { config: resolvedConfig } });
  
  console.log("DB initialized. Generating SQL...");
  // ...
}
main().catch(console.error);
