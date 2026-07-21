import { Client } from 'ssh2';

const SSH = { host: '172.16.0.31', port: 22, username: 'cdc', password: '747351' };
const pgContainer = 'rincq65z8om80zvrbu1eix65';

const queries = [
  'ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "vaccines_id" integer;',
  'ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "vaccine_packages_id" integer;',
  'ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vaccines_fk" FOREIGN KEY ("vaccines_id") REFERENCES "vaccines"("id") ON DELETE CASCADE;',
  'ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vaccine_packages_fk" FOREIGN KEY ("vaccine_packages_id") REFERENCES "vaccine_packages"("id") ON DELETE CASCADE;'
];

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

const conn = new Client();
conn.on('ready', async () => {
  console.log('✅ SSH connected\n');
  try {
    const pgContainer = 'rincq65z8om80zvrbu1eix65';
    console.log('Running FK creation');
    try {
      const out = await execSSH(conn, `docker exec ${pgContainer} psql -U postgres -d postgres -c 'ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vaccine_packages_fk" FOREIGN KEY ("vaccine_packages_id") REFERENCES "vaccine_packages"("id") ON DELETE CASCADE;'`);
      console.log(out);
    } catch (e) {
      console.error(e.message);
    }
    console.log('✅ Check complete!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    conn.end();
  }
});
conn.connect(SSH);
