const fs = require('fs');

const scheduleBlockSQL = `
  // ====================================================
  // BATCH: ScheduleBlock tables for site_settings
  // ====================================================

  \`
    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "icon" varchar,
      "highlight_box_show_highlight" boolean,
      "highlight_box_title" varchar,
      "bottom_note" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_order_idx" ON "site_settings_blocks_schedule_block" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_parent_id_idx" ON "site_settings_blocks_schedule_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_path_idx" ON "site_settings_blocks_schedule_block" ("_path");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block" ADD CONSTRAINT "site_settings_blocks_schedule_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_title" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_order_idx" ON "site_settings_blocks_schedule_block_schedule_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_parent_id_idx" ON "site_settings_blocks_schedule_block_schedule_groups" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_schedule_groups" ADD CONSTRAINT "site_settings_blocks_schedule_block_schedule_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "time" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots_order_idx" ON "site_settings_blocks_schedule_block_schedule_groups_time_slots" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_idx" ON "site_settings_blocks_schedule_block_schedule_groups_time_slots" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_schedule_groups_time_slots" ADD CONSTRAINT "site_settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block_schedule_groups"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content_order_idx" ON "site_settings_blocks_schedule_block_highlight_box_content" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content_parent_id_idx" ON "site_settings_blocks_schedule_block_highlight_box_content" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_highlight_box_content" ADD CONSTRAINT "site_settings_blocks_schedule_block_highlight_box_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  \`,
`;

const path = 'scripts/migrations.mjs';
let content = fs.readFileSync(path, 'utf8');

// 1. Rename 'settings_blocks_magazine_block' to 'site_settings_blocks_magazine_block'
content = content.replace(/settings_blocks_magazine_block/g, 'site_settings_blocks_magazine_block');

// 2. Append site_settings_blocks_schedule_block if not exists
if (!content.includes('CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block"')) {
  content = content.replace('// ====================================================', scheduleBlockSQL + '\n  // ====================================================');
  console.log('Appended site_settings_blocks_schedule_block');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done fixing site_settings tables');
