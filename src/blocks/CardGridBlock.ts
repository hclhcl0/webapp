import type { Block } from 'payload';

export const CardGridBlock: Block = {
  slug: 'cardGridBlock',
  interfaceName: 'CardGridBlock',
  labels: {
    singular: '🗂️ Lưới thẻ Card (Card Grid)',
    plural: 'Lưới thẻ Card',
  },
  fields: [
    {
      name: 'columns',
      type: 'select',
      label: 'Số cột',
      defaultValue: '3',
      options: [
        { label: '2 cột', value: '2' },
        { label: '3 cột', value: '3' },
        { label: '4 cột', value: '4' },
      ],
    },
    {
      name: 'cardStyle',
      type: 'select',
      label: 'Kiểu thẻ',
      defaultValue: 'shadow',
      options: [
        { label: 'Thẻ đổ bóng (Shadow)', value: 'shadow' },
        { label: 'Thẻ viền (Border)', value: 'border' },
        { label: 'Thẻ màu nền (Filled)', value: 'filled' },
        { label: 'Không viền (Minimal)', value: 'minimal' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Danh sách thẻ',
      minRows: 1,
      maxRows: 12,
      labels: { singular: 'Thẻ', plural: 'Các thẻ' },
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji hoặc để trống)',
          admin: { description: 'Dán emoji vào đây. VD: 🏥 📋 💊' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Ảnh thẻ (tùy chọn)',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề thẻ',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả ngắn',
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Đường dẫn liên kết',
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Nhãn nút bấm',
          defaultValue: 'Xem thêm',
        },
        {
          name: 'highlight',
          type: 'checkbox',
          label: 'Nổi bật (highlight)',
          defaultValue: false,
        },
      ],
    },
  ],
};
