import type { CollectionConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';

export const DocumentSigners: CollectionConfig = {
  slug: 'document-signers',
  labels: {
    singular: 'Người ký',
    plural: 'Người ký văn bản',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'updatedAt'],
    group: 'Thông tin Đơn vị & Pháp quy',
    description: 'Quản lý danh sách người ký duyệt các văn bản điều hành, thông báo.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => canAccessModule(user, 'documents', ['admin', 'editor', 'moderator']),
    update: ({ req: { user } }) => canAccessModule(user, 'documents', ['admin', 'editor', 'moderator']),
    delete: ({ req: { user } }) => canAccessModule(user, 'documents', ['admin', 'editor']),
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
      admin: {
        placeholder: 'VD: Giám đốc, Phó Giám đốc, Trưởng phòng...',
      },
    },
  ],
};
