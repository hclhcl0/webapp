const fs = require('fs');

let sql = '';
const addTable = (tableName, cols, constraints, idxs) => {
    sql += `
  \`CREATE TABLE IF NOT EXISTS "site_settings_${tableName}" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    ${cols}
    CONSTRAINT "site_settings_${tableName}_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    ${constraints ? ',' + constraints : ''}
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_${tableName}_order_idx" ON "site_settings_${tableName}" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_${tableName}_parent_idx" ON "site_settings_${tableName}" USING btree ("_parent_id")\`,\n`;
    
    if (idxs) {
        sql += '  ' + idxs;
    }
};

const blockTable = (blockName, extraCols) => {
    addTable(`blocks_${blockName}`, `"_path" text NOT NULL,
    "block_name" varchar,
    ${extraCols}`, '', 
    `\`CREATE INDEX IF NOT EXISTS "site_settings_blocks_${blockName}_path_idx" ON "site_settings_blocks_${blockName}" USING btree ("_path")\`,\n`);
}

// Sidebar Widgets
blockTable('categories_widget', `"title" varchar NOT NULL DEFAULT 'Chuyên mục',
    "limit" numeric DEFAULT 10,`);
blockTable('recent_articles_widget', `"title" varchar NOT NULL DEFAULT 'Tin mới cập nhật',
    "limit" numeric DEFAULT 5,`);
blockTable('tiktok_widget', `"title" varchar DEFAULT 'Kênh TikTok CDC',
    "channel_id" integer,`);
blockTable('facebook_widget', `"title" varchar DEFAULT 'Fanpage CDC',
    "page_url" varchar NOT NULL DEFAULT 'https://www.facebook.com/cdcdanang',
    "height" numeric DEFAULT 350,`);
blockTable('banner_widget', `"title" varchar,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,`);
blockTable('custom_html_widget', `"title" varchar,
    "html_content" text NOT NULL,`);

// Home Sections
blockTable('news_category_section', `"category_id" integer,
    "limit" numeric DEFAULT 2,
    "layout" varchar DEFAULT 'grid',`);
blockTable('banner_section', `"image_id" integer,
    "title" varchar,
    "subtitle" varchar,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "style" varchar DEFAULT 'fullwidth',`);
blockTable('video_section', `"title" varchar DEFAULT 'VIDEO NỔI BẬT',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    "layout" varchar DEFAULT 'grid',`);
blockTable('tiktok_section', `"title" varchar DEFAULT 'KENH TIKTOK CDC DA NANG',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,`);
blockTable('stats_section', `"title" varchar,
    "background_color" varchar DEFAULT 'primary',`);
blockTable('quick_links_section', `"title" varchar DEFAULT 'DICH VU TRUC TUYEN',`);
blockTable('rich_text_section', `"content" jsonb,`);
blockTable('category_news', `"title" varchar,
    "category_info_id" integer,
    "limit" numeric DEFAULT 10,`); // specific name from schema missing

// Nested tables for Stats / Links
sql += `
  \`CREATE TABLE IF NOT EXISTS "site_settings_blocks_stats_section_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🏥',
    "value" varchar NOT NULL,
    "label" varchar NOT NULL,
    "suffix" varchar,
    CONSTRAINT "site_settings_blocks_stats_section_stats_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_stats_section" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_stats_order_idx" ON "site_settings_blocks_stats_section_stats" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_stats_parent_idx" ON "site_settings_blocks_stats_section_stats" USING btree ("_parent_id")\`,
`;

sql += `
  \`CREATE TABLE IF NOT EXISTS "site_settings_blocks_quick_links_section_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🔗',
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT true,
    "color" varchar DEFAULT 'primary',
    CONSTRAINT "site_settings_blocks_quick_links_section_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_quick_links_section" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_links_order_idx" ON "site_settings_blocks_quick_links_section_links" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_links_parent_idx" ON "site_settings_blocks_quick_links_section_links" USING btree ("_parent_id")\`,
`;

// Menu Items
sql += `
  \`CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "preset_url" varchar,
    "url" varchar,
    "open_in_new_tab" boolean,
    CONSTRAINT "site_settings_menu_menu_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_order_idx" ON "site_settings_menu_menu_items" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_parent_idx" ON "site_settings_menu_menu_items" USING btree ("_parent_id")\`,

  \`CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items_sub_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "preset_url" varchar,
    "url" varchar,
    "open_in_new_tab" boolean,
    CONSTRAINT "site_settings_menu_menu_items_sub_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_order_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_parent_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_parent_id")\`,
`;

// Footer Links
sql += `
  \`CREATE TABLE IF NOT EXISTS "site_settings_footer_quick_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "site_settings_footer_quick_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_order_idx" ON "site_settings_footer_quick_links" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_parent_idx" ON "site_settings_footer_quick_links" USING btree ("_parent_id")\`,

  \`CREATE TABLE IF NOT EXISTS "site_settings_footer_social_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "platform" varchar,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "site_settings_footer_social_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_order_idx" ON "site_settings_footer_social_links" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_parent_idx" ON "site_settings_footer_social_links" USING btree ("_parent_id")\`,
`;

// Site Settings Columns
sql += `
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_site_name" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_id" integer\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_height" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_position" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_show_site_name" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_name_line1" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_name_line2" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_tagline" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_banner_image_id" integer\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_logo_id" integer\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_logo_height" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_hover_effect" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_show_site_name" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_position" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_style" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_width" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_phone" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_action_link" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_position" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_facebook" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_youtube" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_twitter" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_instagram" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "menu_menu_position" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sidebar_width_ratio" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sidebar_gap_size" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_about_text" text\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_address_main" text\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_address_sub" text\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_phone" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_email" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_copyright_text" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_designer_credit" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_layout" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_ban_lanh_dao" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_phong" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khoa" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khac" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_size" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_custom_height" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_effect" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_autoplay_delay" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_limit" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_columns_desktop" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_columns_mobile" numeric\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_layout" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_enabled" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_welcome_message" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_custom_prompt" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_hotline" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_address" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_model" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_font_size" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_t_t_s" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_f_b" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_zalo" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_copy_link" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_print" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_read_progress" boolean\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_content" jsonb\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_color" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_dark_color" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_secondary_color" varchar\`,
  \`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar\`,
`;

let migrationsMjs = fs.readFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', 'utf8');

// Replace the closing bracket
migrationsMjs = migrationsMjs.replace(/\]\s*;?\s*$/, `
  // ====================================================
  // BATCH 25 - Add site_settings blocks (Migrated from Settings)
  // ====================================================
  ${sql}
];`);

fs.writeFileSync('D:/CDC/webcq/next-frontend/scripts/migrations.mjs', migrationsMjs);
console.log('Appended SQL to migrations.mjs!');
