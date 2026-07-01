const fs = require('fs');
let migrationsMjs = fs.readFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', 'utf8');

const sql = `
  // ====================================================
  // BATCH 26 - Add popup to site_settings
  // ====================================================
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_enabled" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_title" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_image_id" integer\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_content" jsonb\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_link_url" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_delay_seconds" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_show_once" boolean\`,
`;

migrationsMjs = migrationsMjs.replace(/\]\s*;?\s*$/, sql + '\n];');
fs.writeFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', migrationsMjs);
console.log('Appended popup migrations to migrations.mjs');
