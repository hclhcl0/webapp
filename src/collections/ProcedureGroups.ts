import type { CollectionConfig } from 'payload';

export const ProcedureGroups: CollectionConfig = {
  slug: 'procedureGroups',
  labels: {
    singular: 'Nhóm thủ tục',
    plural: 'Nhóm thủ tục',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /procedures',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Thủ tục hành chính',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên nhóm',
      admin: {
        placeholder: 'VD: Kiểm dịch y tế',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      admin: {
        placeholder: 'kiem-dich-y-te',
        description: 'Dùng cho URL, viết thường, không dấu, dùng gạch ngang',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Biểu tượng (emoji)',
      admin: {
        placeholder: '📋',
        description: 'Dán emoji để làm biểu tượng cho nhóm',
      },
    },
  ],
};
