const fs = require('fs');

const sql = `
  // ====================================================
  // BATCH: MagazineBlock tables
  // ====================================================

  \`
    CREATE TABLE IF NOT EXISTS "pages_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_order_idx" ON "pages_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_parent_id_idx" ON "pages_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_path_idx" ON "pages_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages_order_idx" ON "pages_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages_parent_id_idx" ON "pages_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "pages_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "pages_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  \`,
  \`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_order_idx" ON "_pages_v_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_parent_id_idx" ON "_pages_v_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_path_idx" ON "_pages_v_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages_order_idx" ON "_pages_v_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages_parent_id_idx" ON "_pages_v_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "_pages_v_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "_pages_v_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  \`,
  \`
    CREATE TABLE IF NOT EXISTS "settings_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_magazine_block_order_idx" ON "settings_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_magazine_block_parent_id_idx" ON "settings_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "settings_blocks_magazine_block_path_idx" ON "settings_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "settings_blocks_magazine_block" ADD CONSTRAINT "settings_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "settings_blocks_magazine_block" ADD CONSTRAINT "settings_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "settings_blocks_magazine_block" ADD CONSTRAINT "settings_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "settings_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_magazine_block_magazine_pages_order_idx" ON "settings_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_magazine_block_magazine_pages_parent_id_idx" ON "settings_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "settings_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "settings_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "settings_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "settings_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  \`,
`;

const path = 'scripts/migrations.mjs';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('CREATE TABLE IF NOT EXISTS "pages_blocks_magazine_block"')) {
  content = content.replace('// ====================================================', sql + '\n  // ====================================================');
  fs.writeFileSync(path, content, 'utf8');
  console.log('Appended to migrations.mjs');
} else {
  console.log('Already appended');
}
