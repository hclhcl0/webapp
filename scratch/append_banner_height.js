const fs = require('fs');
const path = 'scripts/migrations.mjs';
let content = fs.readFileSync(path, 'utf8');

const sql = `
  // ====================================================
  // BATCH: Add bannerHeight to multiBannerSection
  // ====================================================
  \`
    DO \\$\\$ BEGIN ALTER TABLE "site_settings_blocks_multi_banner_section" ADD COLUMN "banner_height" integer; EXCEPTION WHEN duplicate_column THEN null; END \\$\\$;
    DO \\$\\$ BEGIN ALTER TABLE "settings_blocks_multi_banner_section" ADD COLUMN "banner_height" integer; EXCEPTION WHEN duplicate_column THEN null; END \\$\\$;
  \`,
`;

if (!content.includes('ADD COLUMN "banner_height"')) {
  content = content.replace('export const MIGRATION_STATEMENTS = [', 'export const MIGRATION_STATEMENTS = [\n' + sql);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Appended banner_height migration successfully.');
} else {
  console.log('Migration already exists.');
}
