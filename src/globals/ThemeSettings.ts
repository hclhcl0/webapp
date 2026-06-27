import type { GlobalConfig } from 'payload';

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'Cài đặt Giao diện',
  admin: {
    group: 'Cài đặt giao diện',
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
        {
          label: 'Kiểu hiển thị Cơ cấu tổ chức',
          fields: [
            {
              name: 'orgLayout',
              type: 'select',
              label: 'Chọn kiểu giao diện trang Cơ cấu tổ chức',
              defaultValue: 'chart_accordion',
              admin: {
                description: 'Thay đổi sẽ có hiệu lực ngay trên trang web.',
              },
              options: [
                {
                  label: '🏛️ Sơ đồ + Danh sách (mặc định) — Sơ đồ cây + accordion nhân sự',
                  value: 'chart_accordion',
                },
                {
                  label: '📁 Thẻ danh sách (Card Grid) — Mỗi phòng/khoa là 1 thẻ, click xem nhân sự',
                  value: 'card_grid',
                },
                {
                  label: '📋 Bảng đơn giản (Simple Table) — Danh sách dạng bảng gọn nhẹ nhất',
                  value: 'simple_table',
                },
                {
                  label: '🗂️ Tabs theo nhóm — 3 tab: Ban lãnh đạo / Phòng chức năng / Khoa chuyên môn',
                  value: 'tabs',
                },
                {
                  label: '🌳 Chỉ Sơ đồ Org Chart — Chỉ hiện sơ đồ cây, không có danh sách nhân sự',
                  value: 'chart_only',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
