import type { CollectionConfig } from 'payload';

export const ZaloMessageLogs: CollectionConfig = {
  slug: 'zalo-message-logs',
  labels: {
    singular: 'Lịch sử tin nhắn',
    plural: 'Lịch sử tin nhắn',
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['zaloUserId', 'direction', 'type', 'content', 'receivedAt'],
    group: 'Lịch sử & Logs',
  },
  access: {
    create: () => false, // Only system creates logs
    update: () => false, // Logs shouldn't be updated
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'zaloUserId', type: 'text', required: true, label: 'Zalo User ID' },
    { name: 'direction', type: 'select', required: true, options: [{ label: 'Nhận', value: 'inbound' }, { label: 'Gửi', value: 'outbound' }], label: 'Hướng tin nhắn' },
    { name: 'type', type: 'text', required: true, label: 'Loại tin nhắn (text, image, zns)' },
    { name: 'content', type: 'textarea', label: 'Nội dung tin nhắn' },
    { name: 'rawPayload', type: 'textarea', label: 'JSON Raw (Debug)' },
    { name: 'receivedAt', type: 'date', defaultValue: () => new Date(), label: 'Thời gian nhận/gửi' },
  ],
};
