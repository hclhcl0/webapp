const { Client } = require('pg');
const client = new Client('postgres://postgres:123456@127.0.0.1:5432/webcq');

async function main() {
  await client.connect();

  // List ALL tables to find any leftovers from old globals
  const res = await client.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND (
      tablename LIKE 'header%' OR
      tablename LIKE 'footer%' OR
      tablename LIKE 'main_menu%' OR
      tablename LIKE 'sidebar%' OR
      tablename LIKE 'theme_settings%' OR
      tablename LIKE 'site_settings%'
    )
    ORDER BY tablename
  `);

  console.log('Found tables:');
  for (const row of res.rows) {
    console.log(' -', row.tablename);
    try {
      await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
      console.log('   Dropped!');
    } catch (e) {
      console.log('   Error:', e.message);
    }
  }

  // Also drop ALL related enum types
  const enums = await client.query(`
    SELECT typname FROM pg_type 
    WHERE typtype = 'e' 
    AND (
      typname LIKE 'enum_header%' OR
      typname LIKE 'enum_footer%' OR
      typname LIKE 'enum_main_menu%' OR
      typname LIKE 'enum_sidebar%' OR
      typname LIKE 'enum_theme%' OR
      typname LIKE 'enum_site_settings%'
    )
    ORDER BY typname
  `);

  console.log('\nFound enums:');
  for (const row of enums.rows) {
    console.log(' -', row.typname);
    try {
      await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
      console.log('   Dropped!');
    } catch (e) {
      console.log('   Error:', e.message);
    }
  }

  await client.end();
  console.log('\nAll clean! Ready to start dev server.');
}

main().catch(console.error);
