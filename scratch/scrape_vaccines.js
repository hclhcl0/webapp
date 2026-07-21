import { fetch } from 'undici';
import * as cheerio from 'cheerio';
import { Client } from 'ssh2';

const SSH = { host: '172.16.0.31', port: 22, username: 'cdc', password: '747351' };
const pgContainer = 'rincq65z8om80zvrbu1eix65';

function execSSH(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      stream.on('data', d => stdout += d);
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`Exit code ${code}`));
        else resolve(stdout);
      });
    });
  });
}

async function run() {
  console.log('🌐 Fetching data from ksbtdanang.vn...');
  const res = await fetch('https://ksbtdanang.vn/services/bang-gia-va-tinh-trang-vac-xin.html');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const vaccines = [];
  
  // Table rows
  $('table tbody tr').each((i, tr) => {
    const tds = [];
    $(tr).find('td').each((j, td) => {
      tds.push($(td).text().trim().replace(/\s+/g, ' '));
    });
    
    // Check if it's a valid data row (must have at least 8 columns and start with a number or valid text)
    if (tds.length >= 8 && tds[2]) {
      const disease = tds[1];
      const name = tds[2];
      const origin = tds[3];
      const statusText = tds[4].toLowerCase();
      const status = statusText.includes('hết') ? 'out_of_stock' : 'in_stock';
      const priceStr = tds[7].replace(/,/g, '');
      const price = parseInt(priceStr, 10);
      
      if (name && !isNaN(price)) {
        vaccines.push({ name, disease, origin, status, price, targetGroup: tds[5] || 'Mọi lứa tuổi' });
      }
    }
  });

  console.log(`✅ Parsed ${vaccines.length} vaccines.`);

  if (vaccines.length === 0) {
    console.log('No vaccines found!');
    return;
  }

  // Generate SQL
  let sql = `
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vaccines_name_key') THEN
    ALTER TABLE vaccines ADD CONSTRAINT vaccines_name_key UNIQUE (name);
  END IF;
END $$;

DO $$
DECLARE
  now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
`;
  
  for (const v of vaccines) {
    const nameSafe = v.name.replace(/'/g, "''");
    const diseaseSafe = v.disease.replace(/'/g, "''");
    const originSafe = v.origin.replace(/'/g, "''");
    const targetGroupSafe = v.targetGroup.replace(/'/g, "''");
    
    sql += `
  INSERT INTO vaccines (name, disease, origin, price, target_group, status, updated_at, created_at)
  VALUES ('${nameSafe}', '${diseaseSafe}', '${originSafe}', ${v.price}, '${targetGroupSafe}', '${v.status}', now_ts, now_ts)
  ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    origin = EXCLUDED.origin,
    disease = EXCLUDED.disease,
    status = EXCLUDED.status,
    updated_at = now_ts;
`;
  }
  
  sql += `
END $$;
`;

  // Write to temporary file for inspection if needed
  // writeFileSync('scratch/sync_live.sql', sql);

  // Execute on production
  console.log('🚀 Connecting to production DB via SSH...');
  const conn = new Client();
  conn.on('ready', async () => {
    console.log('✅ SSH connected');
    try {
      console.log('📤 Sending and executing SQL...');
      await execSSH(conn, `cat > /tmp/sync_live.sql << 'ENDSQL'\n${sql}\nENDSQL`);
      const result = await execSSH(conn, `docker exec -i ${pgContainer} psql -U postgres -d postgres < /tmp/sync_live.sql`);
      console.log('✅ Successfully synced live vaccine data to production!');
      console.log(result);
    } catch (err) {
      console.error('💥 Lỗi SSH execution:', err.message);
    } finally {
      conn.end();
    }
  });
  conn.on('error', err => {
    console.error('SSH Connection Error:', err.message);
  });
  conn.connect(SSH);
}

run().catch(console.error);
