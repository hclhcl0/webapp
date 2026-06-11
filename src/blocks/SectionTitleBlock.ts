import type { Block } from 'payload';

export const SectionTitleBlock: Block = {
  slug: 'sectionTitleBlock',
  interfaceName: 'SectionTitleBlock',
  labels: {
    singular: '🏷️ Tiêu đề Phần (Section Title)',
    plural: 'Tiêu đề Phần',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề chính',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Mô tả phụ (tùy chọn)',
    },
    {
      name: 'level',
      type: 'select',
      label: 'Cấp tiêu đề',
      defaultValue: 'h2',
      options: [
        { label: 'H2 — Tiêu đề phần lớn', value: 'h2' },
        { label: 'H3 — Tiêu đề phần nhỏ', value: 'h3' },
      ],
    },
    {
      name: 'alignment',
      type: 'select',
      label: 'Căn chỉnh',
      defaultValue: 'left',
      options: [
        { label: 'Trái', value: 'left' },
        { label: 'Giữa', value: 'center' },
        { label: 'Phải', value: 'right' },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: 'Kiểu trang trí',
      defaultValue: 'underline',
      options: [
        { label: 'Gạch chân màu chủ đạo', value: 'underline' },
        { label: 'Đường kẻ hai bên', value: 'divider' },
        { label: 'Nền màu chủ đạo', value: 'filled' },
        { label: 'Không có trang trí', value: 'plain' },
      ],
    },
  ],
};
