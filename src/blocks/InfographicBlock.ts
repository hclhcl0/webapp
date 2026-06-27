import type { Block } from 'payload';

export const InfographicBlock: Block = {
  slug: 'infographicBlock',
  interfaceName: 'InfographicBlock',
  labels: {
    singular: '📊 Đồ họa thông tin (Infographic)',
    plural: 'Đồ họa thông tin',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Ảnh Infographic (Chiều cao lớn)',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Mô tả ngắn gọn (tùy chọn)',
    }
  ],
};
