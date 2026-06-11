import type { GlobalConfig } from 'payload';

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'Cài đặt Giao diện',
  admin: {
    group: 'Hệ thống',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false;
      return ['admin', 'editor'].includes(user.role as string);
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Màu sắc Cơ cấu tổ chức',
          fields: [
            {
              name: 'orgColors',
              type: 'group',
              label: 'Cấu hình màu sắc cho các khối',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ban_lanh_dao',
                      type: 'text',
                      label: 'Màu Ban Lãnh đạo',
                      defaultValue: '#0d47a1',
                      admin: { description: 'Nhập mã màu HEX (VD: #0d47a1)', width: '50%' },
                    },
                    {
                      name: 'phong',
                      type: 'text',
                      label: 'Màu Phòng chức năng',
                      defaultValue: '#2e7d32',
                      admin: { description: 'Nhập mã màu HEX (VD: #2e7d32)', width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'khoa',
                      type: 'text',
                      label: 'Màu Khoa chuyên môn',
                      defaultValue: '#1976d2',
                      admin: { description: 'Nhập mã màu HEX (VD: #1976d2)', width: '50%' },
                    },
                    {
                      name: 'khac',
                      type: 'text',
                      label: 'Màu Đơn vị khác',
                      defaultValue: '#e65100',
                      admin: { description: 'Nhập mã màu HEX (VD: #e65100)', width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
