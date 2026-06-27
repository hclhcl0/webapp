import type { Block } from 'payload';

export const AudioBlock: Block = {
  slug: 'audioBlock',
  interfaceName: 'AudioBlock',
  labels: {
    singular: '🎧 Bản tin Âm thanh (Audio / Podcast)',
    plural: 'Bản tin Âm thanh',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề âm thanh (tùy chọn)',
    },
    {
      name: 'sourceType',
      type: 'radio',
      label: 'Nguồn âm thanh',
      defaultValue: 'upload',
      options: [
        { label: 'Tải file lên (MP3/WAV)', value: 'upload' },
        { label: 'Đường dẫn URL bên ngoài', value: 'url' },
      ],
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Chọn file âm thanh',
      admin: {
        condition: (_, siblingData) => siblingData?.sourceType === 'upload',
      },
    },
    {
      name: 'audioUrl',
      type: 'text',
      label: 'URL Âm thanh (Ví dụ: https://...)',
      admin: {
        condition: (_, siblingData) => siblingData?.sourceType === 'url',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn gọn (tùy chọn)',
      admin: {
        rows: 2,
      },
    },
  ],
};
