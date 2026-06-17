import type { CollectionConfig } from 'payload';

export const ZaloBroadcasts: CollectionConfig = {
  slug: 'zalo-broadcasts',
  labels: {
    singular: 'Chiến dịch gửi tin Zalo',
    plural: 'Lịch sử Broadcast',
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'scope', 'status', 'createdAt'],
    group: 'Lịch sử & Logs',
  },
  access: {
    create: () => false, // Handled by webhook or system logic
    update: () => false,
  },
  fields: [
    { name: 'scope', type: 'text', required: true, label: 'Phạm vi' },
    { name: 'content', type: 'textarea', required: true, label: 'Nội dung' },
    { name: 'rawPayload', type: 'textarea', label: 'Payload gốc JSON' },
    { name: 'total', type: 'number', defaultValue: 0, label: 'Tổng số' },
    { name: 'sentCount', type: 'number', defaultValue: 0, label: 'Đã gửi' },
    { name: 'successCount', type: 'number', defaultValue: 0, label: 'Thành công' },
    { name: 'failCount', type: 'number', defaultValue: 0, label: 'Thất bại' },
    { name: 'status', type: 'text', required: true, label: 'Trạng thái' }, // e.g. sending, completed
    { name: 'createdBy', type: 'text', label: 'Người tạo' },
    { name: 'completedAt', type: 'date', label: 'Hoàn thành lúc' },
  ],
};
