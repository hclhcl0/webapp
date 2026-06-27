import type { Block } from 'payload';

export const ZaloWidgetBlock: Block = {
  slug: 'zaloWidgetBlock',
  interfaceName: 'ZaloWidgetBlock',
  labels: {
    singular: '💬 Mã nhúng Zalo OA',
    plural: 'Mã nhúng Zalo OA',
  },
  fields: [
    {
      name: 'oaId',
      type: 'text',
      required: true,
      label: 'Zalo OA ID',
      admin: {
        description: 'Nhập mã ID của Zalo Official Account (Ví dụ: 1234567890)',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề khối (tùy chọn)',
      defaultValue: 'Quan tâm Zalo OA của chúng tôi',
    },
    {
      name: 'widgetType',
      type: 'select',
      label: 'Loại Widget',
      defaultValue: 'chat',
      options: [
        { label: 'Nút Chat nhanh (Chat Widget)', value: 'chat' },
        { label: 'Bảng tin Zalo (Article Widget)', value: 'article' },
        { label: 'Mã QR Quan tâm (Follow Widget)', value: 'follow' },
      ],
    }
  ],
};
