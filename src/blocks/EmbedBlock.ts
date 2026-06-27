import type { Block } from 'payload';

export const EmbedBlock: Block = {
  slug: 'embedBlock',
  interfaceName: 'EmbedBlock',
  labels: {
    singular: '🔗 Nhúng nội dung (Embed / iFrame)',
    plural: 'Nhúng nội dung',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề (tùy chọn)',
    },
    {
      name: 'embedType',
      type: 'select',
      label: 'Loại nhúng',
      defaultValue: 'custom',
      options: [
        { label: 'Mã nhúng tùy chỉnh (HTML/iFrame)', value: 'custom' },
        { label: 'Google Maps', value: 'googlemaps' },
        { label: 'Facebook Fanpage / Post', value: 'facebook' },
        { label: 'Biểu mẫu điền thông tin (Google Form, Microsoft Form)', value: 'form' },
      ],
    },
    {
      name: 'htmlCode',
      type: 'textarea',
      label: 'Mã HTML / iFrame nhúng',
      admin: {
        rows: 6,
        description: 'Dán trực tiếp mã iFrame hoặc mã nhúng vào đây. Hỗ trợ Google Form, Microsoft Form, v.v.',
        condition: (_, siblingData) => siblingData?.embedType === 'custom' || siblingData?.embedType === 'form',
      },
    },
    {
      name: 'googleMapsUrl',
      type: 'text',
      label: 'URL Google Maps (embed URL)',
      admin: {
        description: 'Lấy từ: Google Maps → Share → Embed a map → Copy link src="..."',
        condition: (_, siblingData) => siblingData?.embedType === 'googlemaps',
      },
    },
    {
      name: 'facebookUrl',
      type: 'text',
      label: 'URL Trang / Bài viết Facebook',
      admin: {
        condition: (_, siblingData) => siblingData?.embedType === 'facebook',
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Chiều cao (px)',
      defaultValue: 400,
      min: 100,
      max: 1200,
    },
  ],
};
