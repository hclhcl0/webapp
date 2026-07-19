import type { Block } from 'payload';

export const MagazineBlock: Block = {
  slug: 'magazineBlock',
  labels: {
    singular: 'Tạp chí (Magazine)',
    plural: 'Tạp chí (Magazine)',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tên cuốn tạp chí',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Tiêu đề phụ (VD: Số tháng 7/2026)',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh bìa (Cover Image)',
      required: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'pdfFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Tệp PDF để tải xuống (Tuỳ chọn)',
      filterOptions: {
        mimeType: { contains: 'pdf' },
      },
    },
    {
      name: 'magazinePages',
      type: 'array',
      label: 'Các trang tạp chí (Để xem dạng Slide)',
      labels: {
        singular: 'Trang',
        plural: 'Các trang',
      },
      fields: [
        {
          name: 'pageImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Ảnh của trang này',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
      ],
    },
  ],
};
