import type { Block } from 'payload';

export const StepsBlock: Block = {
  slug: 'stepsBlock',
  interfaceName: 'StepsBlock',
  labels: {
    singular: '🪜 Quy trình / Các bước (Steps)',
    plural: 'Quy trình / Các bước',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề phần (tùy chọn)',
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Kiểu hiển thị',
      defaultValue: 'vertical',
      options: [
        { label: 'Dọc (timeline)', value: 'vertical' },
        { label: 'Ngang (ngang hàng)', value: 'horizontal' },
        { label: 'Số thứ tự lớn', value: 'numbered' },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Danh sách bước',
      minRows: 1,
      maxRows: 10,
      labels: { singular: 'Bước', plural: 'Các bước' },
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji, tùy chọn)',
          admin: { description: 'VD: ✅ 📋 🔍 💊' },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tên bước',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả chi tiết',
        },
        {
          name: 'note',
          type: 'text',
          label: 'Ghi chú phụ (tùy chọn)',
        },
      ],
    },
  ],
};
