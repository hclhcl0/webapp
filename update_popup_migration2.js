const fs = require('fs');
let migrationsMjs = fs.readFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', 'utf8');

const sql = `
  // ====================================================
  // BATCH 27 - Add popup article fields to site_settings
  // ====================================================
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_type" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_article_id" integer\`,
  \`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_popup_article_id_articles_id_fk') THEN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_popup_article_id_articles_id_fk" FOREIGN KEY ("popup_article_id") REFERENCES "articles"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;\`,
`;

migrationsMjs = migrationsMjs.replace(/\]\s*;?\s*$/, sql + '\n];');
fs.writeFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', migrationsMjs);
console.log('Appended popup article migrations to migrations.mjs');
