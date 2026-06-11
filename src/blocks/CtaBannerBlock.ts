import type { Block } from 'payload';

export const CtaBannerBlock: Block = {
  slug: 'ctaBannerBlock',
  interfaceName: 'CtaBannerBlock',
  labels: {
    singular: '📣 Banner Kêu gọi hành động (CTA)',
    plural: 'Banner CTA',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả / Nội dung phụ',
    },
    {
      name: 'style',
      type: 'select',
      label: 'Kiểu nền',
      defaultValue: 'primary',
      options: [
        { label: 'Màu chủ đạo (Primary)', value: 'primary' },
        { label: 'Gradient xanh', value: 'gradient' },
        { label: 'Tối (Dark)', value: 'dark' },
        { label: 'Sáng (Light)', value: 'light' },
        { label: 'Ảnh nền (Image)', value: 'image' },
      ],
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh nền (chỉ dùng khi kiểu = Ảnh nền)',
      admin: {
        condition: (_, siblingData) => siblingData?.style === 'image',
      },
    },
    {
      name: 'primaryButton',
      type: 'group',
      label: 'Nút chính',
      fields: [
        { name: 'label', type: 'text', label: 'Nhãn nút', defaultValue: 'Tìm hiểu thêm' },
        { name: 'url', type: 'text', label: 'Đường dẫn' },
        { name: 'openInNewTab', type: 'checkbox', label: 'Mở tab mới', defaultValue: false },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      label: 'Nút phụ (tùy chọn)',
      fields: [
        { name: 'label', type: 'text', label: 'Nhãn nút' },
        { name: 'url', type: 'text', label: 'Đường dẫn' },
        { name: 'openInNewTab', type: 'checkbox', label: 'Mở tab mới', defaultValue: false },
      ],
    },
  ],
};
