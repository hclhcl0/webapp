import type { Block } from 'payload';

export const SliderBlock: Block = {
  slug: 'sliderBlock',
  interfaceName: 'SliderBlock',
  labels: {
    singular: '🎠 Thanh trượt ảnh (Image Slider)',
    plural: 'Thanh trượt ảnh',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Danh sách hình ảnh',
      minRows: 2,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Hình ảnh',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Chú thích ảnh (tùy chọn)',
        }
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Tự động chạy (Autoplay)',
      defaultValue: true,
    }
  ],
};
