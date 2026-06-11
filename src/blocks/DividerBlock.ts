import type { Block } from 'payload';

export const DividerBlock: Block = {
  slug: 'dividerBlock',
  interfaceName: 'DividerBlock',
  labels: {
    singular: '➖ Phân cách / Khoảng trống (Divider)',
    plural: 'Phân cách',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: 'Kiểu phân cách',
      defaultValue: 'line',
      options: [
        { label: 'Đường kẻ mảnh', value: 'line' },
        { label: 'Đường kẻ đậm (gradient)', value: 'gradient' },
        { label: 'Khoảng trống (không có đường kẻ)', value: 'space' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      label: 'Khoảng cách',
      defaultValue: 'md',
      options: [
        { label: 'Nhỏ (8px)', value: 'sm' },
        { label: 'Vừa (16px)', value: 'md' },
        { label: 'Lớn (32px)', value: 'lg' },
        { label: 'Rất lớn (64px)', value: 'xl' },
      ],
    },
  ],
};
