---
name: payload-add-block-migration
description: >-
  Instructions for adding a new Block in Payload CMS v3 and correctly generating database migrations to prevent production deployment failures on Coolify.
---

# Payload CMS: Add Block & Migration

## Overview
When adding a new Block in Payload CMS v3 (especially in a Next.js App Router project deployed on Coolify), simply creating the Block definition and registering it is NOT enough. Because Coolify runs `node migrate.mjs && next build` without interactive prompts, Drizzle will fail to create the database tables if the migration is missing. This causes `relation does not exist` errors in production.

This skill provides the exact workflow to safely add a Block and generate its SQL migration.

## Workflow

### 1. Create and Register the Block
- Create your Block file in `src/blocks/YourBlock.ts`.
- Register it in the necessary collections (e.g., `src/collections/Pages.ts`) or globals (e.g., `src/globals/Settings.ts`).
- **CRITICAL**: Ensure all file paths and casing match exactly (e.g., `../blocks/YourBlock` instead of `../Blocks/YourBlock`) because Linux deployments are case-sensitive.

### 2. Generate the Migration
You must generate the migration SQL before committing.
Run the following command:
```bash
npx payload migrate:create --file yourBlockName
```

### 3. Handle Node 24 ESM/CommonJS Bugs (If Applicable)
If `payload migrate:create` fails with `Cannot destructure property 'loadEnvConfig' of 'import_env.default'` or `ERR_REQUIRE_ASYNC_MODULE` (common in Node 24 with TSX):
1. Temporarily patch `node_modules/payload/dist/bin/loadEnv.js`:
   Replace:
   ```javascript
   import nextEnvImport from '@next/env';
   const { loadEnvConfig } = nextEnvImport;
   ```
   With:
   ```javascript
   const nextEnvImport = require('@next/env');
   const { loadEnvConfig } = nextEnvImport;
   ```
2. Re-run `npx payload migrate:create --file yourBlockName`.
3. If it generates a file in `src/migrations`, move its contents into `scripts/migrations.mjs` if the project uses a centralized migration script, or keep it in the migrations folder depending on the project's setup.

### 4. Manually Writing SQL (Fallback)
If migration generation completely fails, you must manually write the SQL to `scripts/migrations.mjs`.
A typical Payload block in `Pages` generates 4 tables:
- `pages_blocks_your_block` (ID is varchar)
- `_pages_v_blocks_your_block` (ID is integer/serial, contains `_uuid`)
- Any arrays inside the block generate their own sub-tables (e.g., `pages_blocks_your_block_array_name`).
Make sure to add `DO $$ BEGIN ALTER TABLE ... END $$;` for foreign keys.

### 5. Test Locally
Always run `node --env-file=.env scripts/migrations.mjs` (or your project's equivalent DB sync command) to verify the SQL syntax before committing.

## Common Mistakes
- **Forgetting to generate migration**: Causes `relation does not exist` runtime crashes.
- **Incorrect Case Sensitivity**: Importing `../Blocks` instead of `../blocks` works on Windows/Mac but fails on Coolify (Linux) during `next build`.
- **String Replace Regex Bug**: When using JS `.replace()` to inject SQL, `$$` is parsed as a single `$` by the regex engine. Use `replace(/.../, () => 'DO $$ BEGIN')` to avoid corrupting SQL syntax.
