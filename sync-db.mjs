import { getPayload } from 'payload'
process.env.PAYLOAD_FORCE_PUSH = 'true'

import config from './src/payload.config.ts'

async function sync() {
  try {
    console.log('Đang khởi tạo Payload và đồng bộ Database schema...')
    const payload = await getPayload({ config })
    console.log('✅ Payload đã khởi tạo và Database đã đồng bộ thành công!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Lỗi đồng bộ DB:', err)
    process.exit(1)
  }
}
sync()
