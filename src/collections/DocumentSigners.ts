import type { CollectionConfig } from 'payload';

export const DocumentSigners: CollectionConfig = {
  slug: 'document-signers',
  labels: {
    singular: 'Người ký',
    plural: 'Người ký văn bản',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role as string),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Họ và tên',
    },
    {
      name: 'position',
      type: 'text',
      label: 'Chức vụ',
    },
  ],
};
