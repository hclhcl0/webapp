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
    beforeValidate: [
      ({ data }) => {
        if (data) {
          if (!data.icon || typeof data.icon !== 'string' || data.icon.trim() === '') {
            data.icon = '🔥';
          }
          if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
            data.title = 'Cảnh báo quan trọng';
          }
          // Chuẩn hóa mảng videos: trích xuất ID nếu là object, chuyển sang number hợp lệ
          if (Array.isArray(data.videos)) {
            data.videos = data.videos
              .map((v: any) => {
                if (typeof v === 'object' && v !== null && v.id) return v.id;
                if (typeof v === 'number') return v;
                if (typeof v === 'string' && v.trim() !== '') {
                  const num = Number(v);
                  return isNaN(num) ? v : num;
                }
                return null;
              })
              .filter((v: any) => v !== null && v !== undefined);
          }
        }
        return data;
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (!doc.icon) doc.icon = '🔥';
        if (!doc.title) doc.title = 'Cảnh báo quan trọng';
        if (doc.isEnabled === undefined) doc.isEnabled = true;
        if (!doc.videoSource) doc.videoSource = 'manual';
        if (!doc.videos) doc.videos = [];
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
          validate: () => true,
          options: [
            { label: '🔥 Lửa (Khẩn cấp)', value: '🔥' },
            { label: '🚨 Còi báo động (Cấp cứu)', value: '🚨' },
            { label: '⚠️ Biển cảnh báo (Lưu ý)', value: '⚠️' },
            { label: '📢 Loa phát thanh (Thông báo)', value: '📢' },
            { label: '⚡ Tia sét (Nóng / Tiêu điểm)', value: '⚡' },
            { label: '🔴 Chấm đỏ (Quan trọng)', value: '🔴' },
            { label: '🛡️ Phòng chống dịch', value: '🛡️' },
            { label: '⚠️ Biển cảnh báo (Chuẩn)', value: '\u26A0\uFE0F' },
            { label: '⚡ Tia sét (Chuẩn)', value: '\u26A1\uFE0F' },
            { label: '🛡️ Phòng chống dịch (Chuẩn)', value: '\uD83D\uDEE1\uFE0F' },
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
      name: 'videoSource',
      type: 'radio',
      label: 'Cách thức lấy Video cảnh báo',
      defaultValue: 'manual',
      options: [
        { label: 'Chỉ hiển thị các video chọn trong danh sách dưới (Nếu xóa hết hoặc để trống: KHÔNG hiển thị video)', value: 'manual' },
        { label: 'Tự động lấy các video được đánh dấu "Video cảnh báo" mới nhất', value: 'auto_warning' },
      ],
      admin: {
        description: 'Mặc định: Chỉ hiển thị các video bạn chọn bên dưới. Khi xóa hết video thì website sẽ ẩn video cảnh báo.',
      },
    },
    {
      name: 'videos',
      type: 'relationship',
      relationTo: 'videos',
      hasMany: true,
      required: false,
      validate: () => true,
      label: 'Danh sách Video cảnh báo chỉ định',
      admin: {
        isSortable: false,
        allowCreate: false,
        condition: (data) => data?.videoSource !== 'auto_warning',
        description: 'Chọn các video hiển thị trong khung cảnh báo. Nếu xóa hết danh sách này, website sẽ không hiển thị video.',
      },
    },
  ],
};
