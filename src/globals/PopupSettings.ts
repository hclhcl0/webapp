import type { GlobalConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';

export const PopupSettings: GlobalConfig = {
  slug: 'popup-settings',
  label: '3. Thông báo (Popup)',
  admin: {
    group: 'Quản lý Banner & Quảng cáo',
    description: 'Cấu hình cửa sổ thông báo tự động bật lên (Popup modal) khi người dùng truy cập trang web.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => canAccessModule(user, 'banners', ['admin', 'editor', 'moderator']),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        // Tự động sao chép cấu hình popup từ site-settings nếu global mới chưa có dữ liệu
        if (doc?.enabled === undefined && !doc?.title && !doc?.servicesTitle) {
          try {
            const siteSettings: any = await req.payload.findGlobal({
              slug: 'site-settings',
              depth: 2,
            });
            const p = siteSettings?.popup;
            if (p) {
              doc.enabled = p.enabled ?? false;
              doc.type = p.type || 'manual';
              doc.title = p.title || 'THÔNG BÁO QUAN TRỌNG';
              doc.image = p.image || null;
              doc.videoUrl = p.videoUrl || '';
              doc.content = p.content || null;
              doc.linkUrl = p.linkUrl || '';
              doc.delaySeconds = p.delaySeconds ?? 1;
              doc.showOnce = p.showOnce !== false;
              doc.transparentBackground = Boolean(p.transparentBackground);
              doc.article = p.article || null;
              doc.servicesTitle = p.servicesTitle || 'Dịch vụ & Thông báo CDC Đà Nẵng';
              doc.servicesSubtitle = p.servicesSubtitle || '';
              doc.servicesMascot = p.servicesMascot || null;
              doc.servicesHeaderColor = p.servicesHeaderColor || '#00a99d';
              doc.servicesItems = p.servicesItems || [];
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
      name: 'enabled',
      type: 'checkbox',
      label: 'Bật cửa sổ thông báo (Popup)',
      defaultValue: false,
      admin: {
        description: 'Khi bật, cửa sổ popup sẽ hiển thị ngay khi người dùng truy cập trang web.',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Kiểu hiển thị',
      defaultValue: 'manual',
      options: [
        { label: 'Tự soạn thảo (Manual)', value: 'manual' },
        { label: 'Lấy từ Bài viết (Article)', value: 'article' },
        { label: '📋 Danh sách dịch vụ / Thông báo (Services)', value: 'services' },
      ],
      admin: {
        condition: (data) => data?.enabled,
      },
    },
    // ── Fields for Services popup type ──────────────────────
    {
      name: 'servicesTitle',
      type: 'text',
      label: '[Dịch vụ] Tiêu đề banner',
      defaultValue: 'Dịch vụ & Thông báo CDC Đà Nẵng',
      admin: {
        condition: (data) => data?.enabled && data?.type === 'services',
        description: 'Tiêu đề hiển thị trên banner màu xanh ở đầu popup.',
      },
    },
    {
      name: 'servicesSubtitle',
      type: 'text',
      label: '[Dịch vụ] Phụ đề banner',
      admin: {
        condition: (data) => data?.enabled && data?.type === 'services',
      },
    },
    {
      name: 'servicesMascot',
      type: 'upload',
      relationTo: 'media',
      label: '[Dịch vụ] Ảnh mascot / nhân vật',
      admin: {
        condition: (data) => data?.enabled && data?.type === 'services',
        description: 'Ảnh nhân vật nổi phía trên popup. Nên dùng ảnh nền trong suốt (PNG).',
      },
    },
    {
      name: 'servicesHeaderColor',
      type: 'text',
      label: '[Dịch vụ] Màu banner (hex)',
      defaultValue: '#00a99d',
      admin: {
        condition: (data) => data?.enabled && data?.type === 'services',
        description: 'Màu nền của banner tiêu đề. Ví dụ: #00a99d, #1a4fa0',
      },
    },
    {
      name: 'servicesItems',
      type: 'array',
      label: '[Dịch vụ] Danh sách mục',
      admin: {
        condition: (data) => data?.enabled && data?.type === 'services',
        description: 'Thêm các mục thông tin dịch vụ hoặc thông báo muốn hiển thị trong popup.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Biểu tượng (Icon)',
              defaultValue: '💉',
              options: [
                { label: '💉 Tiêm chủng / Vắc xin', value: '💉' },
                { label: '🏥 Bệnh viện / Cơ sở y tế', value: '🏥' },
                { label: '🧪 Xét nghiệm / Phòng Lab', value: '🧪' },
                { label: '🩺 Khám bệnh / Sức khỏe', value: '🩺' },
                { label: '💊 Dược phẩm / Thuốc', value: '💊' },
                { label: '📋 Hồ sơ / Thủ tục hành chính', value: '📋' },
                { label: '👥 Đội ngũ / Bác sĩ', value: '👥' },
                { label: '📞 Tổng đài / Hotline', value: '📞' },
                { label: '🌐 Dịch vụ công trực tuyến', value: '🌐' },
                { label: '📄 Tra cứu kết quả / Văn bản', value: '📄' },
                { label: '🛡️ Phòng chống dịch bệnh', value: '🛡️' },
                { label: '⚡ Thông báo khẩn cấp', value: '⚡' },
              ],
              admin: { width: '40%' },
            },
            {
              name: 'iconImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Hoặc ảnh Icon tải lên (tùy chọn)',
              admin: { width: '60%' },
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề mục',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Mô tả ngắn',
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Đường dẫn (để trống nếu không có link)',
          admin: {
            description: 'Nếu điền, mục này sẽ có nút mũi tên và có thể nhấn vào.',
          },
        },
      ],
    },
    // ── Fields for Manual / Article popup type ──────────────
    {
      name: 'transparentBackground',
      type: 'checkbox',
      label: 'Giao diện trong suốt (Xóa nền trắng và viền)',
      defaultValue: false,
      admin: {
        condition: (data) => data?.enabled && data?.type === 'manual',
        description: 'Dùng khi bạn chỉ chèn một video hoặc hình ảnh và không muốn có nền trắng xung quanh.',
      },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      label: 'Chọn Bài viết',
      hasMany: false,
      admin: {
        condition: (data) => data?.enabled && data?.type === 'article',
        description: 'Hệ thống sẽ lấy Tiêu đề, Ảnh đại diện, Mô tả ngắn và tự động gắn link "Đọc tiếp" trỏ đến bài viết này.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề thông báo',
      defaultValue: 'THÔNG BÁO QUAN TRỌNG',
      admin: {
        condition: (data) => data?.enabled && data?.type !== 'article',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh banner minh họa',
      admin: {
        condition: (data) => data?.enabled && data?.type !== 'article',
        description: 'Hiển thị ở trên cùng của popup. Kích thước khuyến nghị: ngang (landscape).',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Đường dẫn Video (YouTube, MP4...)',
      admin: {
        condition: (data) => data?.enabled && data?.type !== 'article',
        description: 'Nhập link YouTube để hiển thị video trên cùng của popup (thay vì hình ảnh tĩnh)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Nội dung chi tiết',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [
              VideoBlock,
              EmbedBlock,
              TikTokBlock,
            ],
          }),
        ],
      }),
      admin: {
        condition: (data) => data?.enabled && data?.type !== 'article',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Đường dẫn chuyển hướng (URL)',
      admin: {
        condition: (data) => data?.enabled && data?.type !== 'article',
        description: 'Nếu điền, sẽ có nút "Tìm hiểu thêm" để người dùng bấm vào xem chi tiết.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'delaySeconds',
          type: 'number',
          label: 'Thời gian trễ (giây)',
          defaultValue: 1,
          min: 0,
          max: 30,
          admin: {
            condition: (data) => data?.enabled,
            description: 'Chờ bao nhiêu giây sau khi trang tải xong mới hiện popup.',
          },
        },
        {
          name: 'showOnce',
          type: 'checkbox',
          label: 'Chỉ hiển thị 1 lần cho mỗi người dùng',
          defaultValue: true,
          admin: {
            condition: (data) => data?.enabled,
            description: 'Khi bật, nếu người dùng đã đóng popup, lần sau truy cập sẽ không hiện lại để tránh phiền hà (lưu qua localStorage).',
          },
        },
      ],
    },
  ],
};
