import type { CollectionConfig } from 'payload';

export const Procedures: CollectionConfig = {
  slug: 'procedures',
  labels: {
    singular: 'Thủ tục hành chính',
    plural: 'Thủ tục hành chính',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'publishedDate', 'status'],
    group: 'Thủ tục hành chính',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên thủ tục',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      admin: {
        description: 'Để trống sẽ tự tạo từ tên thủ tục',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.title && !data.slug) {
              const slugify = (str: string) =>
                str
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[đĐ]/g, 'd')
                  .replace(/([^a-z0-9\s])/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
              return slugify(data.title);
            }
          },
        ],
      },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'procedureGroups',
      label: 'Nhóm thủ tục',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'active',
      options: [
        { label: 'Còn hiệu lực', value: 'active' },
        { label: 'Hết hiệu lực', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Ngày ban hành',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'implementationTime',
      type: 'text',
      label: 'Thời gian thực hiện',
      admin: {
        placeholder: 'VD: 05 ngày làm việc',
      },
    },
    {
      name: 'fee',
      type: 'text',
      label: 'Phí, lệ phí',
      admin: {
        placeholder: 'VD: 100.000 VNĐ / Không có',
      },
    },
    {
      name: 'result',
      type: 'text',
      label: 'Kết quả thực hiện',
      admin: {
        placeholder: 'VD: Giấy chứng nhận...',
      },
    },
    {
      name: 'requirements',
      type: 'richText',
      label: 'Yêu cầu, điều kiện thực hiện',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'Biểu mẫu đính kèm (File PDF/Word)',
      admin: {
        description: 'Tải lên file biểu mẫu nếu có',
      },
    },
    {
      name: 'driveUrl',
      type: 'text',
      label: 'Link Google Drive',
      admin: {
        description: 'Hoặc dán link chia sẻ Google Drive (sẽ ưu tiên dùng link này nếu có)',
      },
    },
  ],
};
