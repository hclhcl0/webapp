import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function run() {
  console.log('Initializing Payload...');
  try {
    const payload = await getPayload({ config: configPromise });
    console.log('Payload initialized.');
    
    // Explicitly call the database push/sync method if available
    if (payload.db && typeof payload.db.push === 'function') {
      console.log('Running database push...');
      await payload.db.push();
      console.log('Database push completed successfully!');
    } else {
      console.log('payload.db.push is not a function or not available.');
    }
  } catch (e) {
    console.error('Error running push:', e);
  }
}
run();
