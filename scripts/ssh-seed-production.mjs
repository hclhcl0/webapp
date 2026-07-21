/**
 * SSH vào server production, tìm container PostgreSQL và chạy SQL seed
 */
import { readFileSync } from 'fs';
import { Client } from 'ssh2';

const SSH = { host: '172.16.0.31', port: 22, username: 'cdc', password: '747351' };
const PROD_DB_URL = 'postgres://postgres:FxDhfDFlPG8WS17m7QiR1oBAH3JHJlNBWsmWCmrA50IihPiT3xwJR6JT9wEwh93W@rincq65z8om80zvrbu1eix65:5432/postgres';

// SQL seed content từ file
const sqlFile = readFileSync('./scripts/seed-production.sql', 'utf8');
// Escape cho shell
const escapedSql = sqlFile.replace(/'/g, "'\\''");

function execSSH(conn, cmd) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('data', d => { stdout += d; process.stdout.write(d.toString()); });
      stream.stderr.on('data', d => { stderr += d; process.stderr.write(d.toString()); });
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`Exit ${code}: ${stderr}`));
        else resolve(stdout);
      });
    });
  });
}

const conn = new Client();
conn.on('ready', async () => {
  console.log('✅ SSH connected\n');
  try {
    const pgContainer = 'rincq65z8om80zvrbu1eix65';
    console.log(`📦 Container: ${pgContainer}\n`);

    // 3. Copy SQL file vào container và chạy
    console.log('📤 Copy seed SQL lên server...');
    await execSSH(conn, `cat > /tmp/seed-vaccine.sql << 'ENDSQL'\n${sqlFile}\nENDSQL`);

    console.log('🌱 Chạy seed SQL...');
    const result = await execSSH(conn, `docker exec -i ${pgContainer} psql -U postgres -d postgres < /tmp/seed-vaccine.sql`);
    console.log('\n✅ Seed production thành công!');
    console.log(result);

    // 4. Verify packages
    console.log('\n📊 Xác nhận kết quả Packages:');
    await execSSH(conn, `docker exec ${pgContainer} psql -U postgres -d postgres -c "SELECT id, name, is_active, (SELECT COUNT(*) FROM vaccine_packages_items WHERE _parent_id=vp.id) as items FROM vaccine_packages vp ORDER BY \\\"order\\\""`);

    // Verify vaccines
    console.log('\n📊 Xác nhận kết quả Vaccines:');
    await execSSH(conn, `docker exec ${pgContainer} psql -U postgres -d postgres -c "SELECT count(*) as total_vaccines FROM vaccines"`);

    conn.end();
  } catch (err) {
    console.error('\n💥 Lỗi:', err.message);
  } finally {
    conn.end();
  }
});

conn.on('error', err => {
  console.error('SSH Error:', err.message);
  process.exit(1);
});

conn.connect(SSH);
