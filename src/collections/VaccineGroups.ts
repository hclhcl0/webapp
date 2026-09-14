import type { CollectionConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';

export const VaccineGroups: CollectionConfig = {
  slug: 'vaccine-groups',
  labels: {
    singular: 'Nhóm Bệnh Phòng',
    plural: 'Nhóm Bệnh Phòng',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: 'Dịch vụ Y tế & Tiêm chủng',
    description: 'Quản lý danh sách nhóm bệnh phòng dùng trong Gói Vắc Xin (VD: Phòng Não mô cầu B, Phòng Viêm gan B, ...)',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator', 'editor']),
    update: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator', 'editor']),
    delete: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator']),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên nhóm bệnh phòng',
      required: true,
      admin: {
        description: 'VD: Phòng Não mô cầu B, Phòng Viêm gan B, Phòng Bạch hầu - Ho gà - Uốn ván...',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Số nhỏ hơn hiển thị trước',
      },
    },
  ],
};
