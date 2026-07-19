import type { Block } from 'payload';

export const ExcelTableBlock: Block = {
  slug: 'excelTableBlock',
  interfaceName: 'ExcelTableBlock',
  labels: {
    singular: '📗 Tải & Hiển thị Excel (Bảng giá)',
    plural: 'Khối Tải & Hiển thị Excel',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề bảng (Tùy chọn)',
      admin: {
        description: 'VD: Bảng giá dịch vụ tiêm chủng',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Chọn file Excel (.xlsx, .xls, .csv)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sheetName',
          type: 'text',
          label: 'Tên Sheet cần hiển thị (Tùy chọn)',
          admin: {
            description: 'Bỏ trống để tự động lấy Sheet đầu tiên.',
          },
        },
        {
          name: 'hasHeader',
          type: 'checkbox',
          label: 'Hàng đầu tiên là Tiêu đề cột',
          defaultValue: true,
        },
      ]
    },
    {
      name: 'showDownload',
      type: 'checkbox',
      label: 'Hiển thị nút Tải về',
      defaultValue: true,
    }
  ],
};
