import type { GlobalConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';

export const VideoWarningSettings: GlobalConfig = {
  slug: 'video-warning-settings',
  label: '3. Cấu hình Cảnh báo quan trọng',
  admin: {
    group: 'Quản lý Video',
    description: 'Cấu hình cột Cảnh báo quan trọng hiển thị bên cạnh Slider trên Trang chủ (Video cảnh báo dịch bệnh, thông tin khẩn cấp).',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => canAccessModule(user, 'videos', ['admin', 'editor', 'moderator']),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        // Tự động sao chép dữ liệu từ site-settings cũ nếu global mới chưa có cấu hình
        if (!doc?.title || !doc?.videos || (Array.isArray(doc.videos) && doc.videos.length === 0)) {
          try {
            const siteSettings: any = await req.payload.findGlobal({
              slug: 'site-settings',
              depth: 1,
            });
            const ws = siteSettings?.warningSection;
            if (ws) {
              if (doc.isEnabled === undefined && ws.isEnabled !== undefined) doc.isEnabled = ws.isEnabled;
              if (!doc.title && ws.title) doc.title = ws.title;
              if (!doc.icon && ws.icon) doc.icon = ws.icon;
              if ((!doc.videos || doc.videos.length === 0) && ws.videos?.length > 0) {
                doc.videos = ws.videos;
              }
            }
          } catch (e) {
            // ignore
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: 'Hiển thị Cảnh báo quan trọng trên Trang chủ',
      defaultValue: true,
      admin: {
        description: 'Bật/tắt toàn bộ cột Cảnh báo quan trọng bên phải Slider trang chủ.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Biểu tượng cảnh báo',
          defaultValue: '🔥',
          options: [
            { label: '🔥 Lửa (Khẩn cấp)', value: '🔥' },
            { label: '🚨 Còi báo động (Cấp cứu)', value: '🚨' },
            { label: '⚠️ Biển cảnh báo (Lưu ý)', value: '⚠️' },
            { label: '📢 Loa phát thanh (Thông báo)', value: '📢' },
            { label: '⚡ Tia sét (Nóng / Tiêu điểm)', value: '⚡' },
            { label: '🔴 Chấm đỏ (Quan trọng)', value: '🔴' },
            { label: '🛡️ Phòng chống dịch', value: '🛡️' },
          ],
          admin: {
            width: '40%',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề cảnh báo',
          defaultValue: 'Cảnh báo quan trọng',
          admin: {
            width: '60%',
          },
        },
      ],
    },
    {
      name: 'videos',
      type: 'relationship',
      relationTo: 'videos',
      hasMany: true,
      label: 'Danh sách Video cảnh báo chỉ định',
      admin: {
        description: 'Chọn các video hiển thị trong khung cảnh báo. Nếu để trống, hệ thống sẽ tự động lấy các video được đánh dấu "Video cảnh báo" mới nhất.',
      },
    },
  ],
};
