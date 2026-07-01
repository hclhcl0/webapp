-- Fix schema: add missing columns to site_settings table
-- Run this on the production PostgreSQL database

ALTER TABLE site_settings
  -- Banner tab columns
  ADD COLUMN IF NOT EXISTS banner_hero_slider_size varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_slider_custom_height numeric,
  ADD COLUMN IF NOT EXISTS banner_hero_slider_effect varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_slider_autoplay_delay numeric,

  -- Homepage tab columns
  ADD COLUMN IF NOT EXISTS homepage_home_news_limit numeric,
  ADD COLUMN IF NOT EXISTS homepage_home_news_columns_desktop numeric,
  ADD COLUMN IF NOT EXISTS homepage_home_news_columns_mobile numeric,
  ADD COLUMN IF NOT EXISTS homepage_home_news_layout varchar,

  -- AI Chat tab columns
  ADD COLUMN IF NOT EXISTS ai_chat_chat_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_chat_chat_welcome_message varchar,
  ADD COLUMN IF NOT EXISTS ai_chat_chat_custom_prompt varchar,
  ADD COLUMN IF NOT EXISTS ai_chat_ai_hotline varchar,
  ADD COLUMN IF NOT EXISTS ai_chat_ai_address varchar,
  ADD COLUMN IF NOT EXISTS ai_chat_ai_model varchar,

  -- Reader Tools tab columns
  ADD COLUMN IF NOT EXISTS reader_tools_show_font_size boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_t_t_s boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_share_f_b boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_share_zalo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_copy_link boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_print boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS reader_tools_show_read_progress boolean DEFAULT true;

SELECT 'Schema updated successfully' as result;
