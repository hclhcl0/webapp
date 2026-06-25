import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function sync() {
  try {
    const payload = await getPayload({ config })
    console.log('Payload initialized and DB synced!')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
sync()
