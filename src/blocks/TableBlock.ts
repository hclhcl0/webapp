import type { Block } from 'payload';

export const TableBlock: Block = {
  slug: 'tableBlock',
  interfaceName: 'TableBlock',
  labels: {
    singular: '📊 Bảng dữ liệu (Table)',
    plural: 'Bảng dữ liệu',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề bảng (tùy chọn)',
    },
    {
      name: 'headers',
      type: 'array',
      label: 'Các cột tiêu đề',
      minRows: 1,
      maxRows: 8,
      labels: { singular: 'Cột', plural: 'Các cột' },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Nhãn cột',
          required: true,
        },
        {
          name: 'align',
          type: 'select',
          label: 'Căn chỉnh',
          defaultValue: 'left',
          options: [
            { label: 'Trái', value: 'left' },
            { label: 'Giữa', value: 'center' },
            { label: 'Phải', value: 'right' },
          ],
        },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Các hàng dữ liệu',
      minRows: 1,
      labels: { singular: 'Hàng', plural: 'Các hàng' },
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: 'Các ô trong hàng',
          minRows: 1,
          maxRows: 8,
          labels: { singular: 'Ô', plural: 'Các ô' },
          fields: [
            {
              name: 'content',
              type: 'text',
              label: 'Nội dung ô',
              required: true,
            },
            {
              name: 'highlight',
              type: 'checkbox',
              label: 'Nổi bật',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Chú thích bảng (tùy chọn)',
    },
    {
      name: 'striped',
      type: 'checkbox',
      label: 'Hàng xen kẽ màu',
      defaultValue: true,
    },
    {
      name: 'bordered',
      type: 'checkbox',
      label: 'Có viền bảng',
      defaultValue: true,
    },
  ],
};
