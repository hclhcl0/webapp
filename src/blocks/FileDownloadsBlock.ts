import type { Block } from 'payload';

export const FileDownloadsBlock: Block = {
  slug: 'fileDownloadsBlock',
  interfaceName: 'FileDownloadsBlock',
  labels: {
    singular: '📎 Danh sách Tài liệu tải về',
    plural: 'Các danh sách Tài liệu tải về',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề khối (VD: Tài liệu đính kèm)',
      defaultValue: 'Tài liệu đính kèm',
    },
    {
      name: 'files',
      type: 'array',
      label: 'Danh sách File',
      minRows: 1,
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Chọn tệp (PDF, DOCX, XLSX, ZIP...)',
        },
        {
          name: 'customName',
          type: 'text',
          label: 'Tên hiển thị (để trống sẽ dùng tên gốc của file)',
        }
      ],
    },
  ],
};
