import type { CollectionConfig } from 'payload';

export const ZaloSystemConfigs: CollectionConfig = {
  slug: 'zalo-system-configs',
  labels: {
    singular: 'Cấu hình hệ thống (Zalo)',
    plural: 'Cấu hình hệ thống (Zalo)',
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'label', 'value', 'updatedAt'],
    group: 'Cấu hình',
    hidden: true,
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, label: 'Khóa cấu hình' },
    { name: 'value', type: 'textarea', required: true, label: 'Giá trị' },
    { name: 'label', type: 'text', label: 'Tên mô tả' },
  ],
};
