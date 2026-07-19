const { getPayload } = require('payload');
const config = require('./src/payload.config.ts').default;

async function run() {
  process.env.PAYLOAD_FORCE_PUSH = 'true';
  const payload = await getPayload({ config });
  console.log('✅ Payload initialized and schema pushed!');
  process.exit(0);
}

run();
