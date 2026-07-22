import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq',
});

const sql = `
select "payload_locked_documents"."id", "payload_locked_documents"."global_slug", "payload_locked_documents"."updated_at", "payload_locked_documents__rels"."data" as "_rels" from "payload_locked_documents" "payload_locked_documents" left join lateral (select coalesce(json_agg(json_build_array("payload_locked_documents__rels"."order", "payload_locked_documents__rels"."path", "payload_locked_documents__rels"."departments_id", "payload_locked_documents__rels"."users_id", "payload_locked_documents__rels"."media_id", "payload_locked_documents__rels"."categories_id", "payload_locked_documents__rels"."tags_id", "payload_locked_documents__rels"."articles_id", "payload_locked_documents__rels"."pages_id", "payload_locked_documents__rels"."banners_id", "payload_locked_documents__rels"."documents_id", "payload_locked_documents__rels"."document_signers_id", "payload_locked_documents__rels"."work_schedules_id", "payload_locked_documents__rels"."video_channels_id", "payload_locked_documents__rels"."videos_id", "payload_locked_documents__rels"."form_submissions_id", "payload_locked_documents__rels"."org_units_id", "payload_locked_documents__rels"."ai_knowledge_id", "payload_locked_documents__rels"."api_keys_id", "payload_locked_documents__rels"."procurements_id", "payload_locked_documents__rels"."vaccines_id", "payload_locked_documents__rels"."vaccine_packages_id") order by "payload_locked_documents__rels"."order" asc), '[]'::json) as "data" from (select * from "payload_locked_documents_rels" "payload_locked_documents__rels" where "payload_locked_documents__rels"."parent_id" = "payload_locked_documents"."id" order by "payload_locked_documents__rels"."order" asc) "payload_locked_documents__rels") "payload_locked_documents__rels" on true where "payload_locked_documents"."global_slug" is not null order by "payload_locked_documents"."created_at" desc
`;

async function run() {
  try {
    const res = await pool.query(sql);
    console.log('✅ QUERY SUCCESSFUL! Result rows:', res.rows.length);
  } catch (err) {
    console.error('❌ QUERY ERROR:', err.message, '\nCode:', err.code);
  } finally {
    await pool.end();
  }
}

run();
