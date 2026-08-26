import type { GlobalConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';

export const BannerSettings: GlobalConfig = {
  slug: 'banner-settings',
  label: '2. Sidebar Quảng cáo dịch vụ và các banner khác',
  admin: {
    group: 'Quản lý Banner & Quảng cáo',
    description: 'Cấu hình khối Sidebar quảng cáo dịch vụ (ảnh 9:16), Banner cột bên trái và Cài đặt Slider trang chủ.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => canAccessModule(user, 'banners', ['admin', 'editor', 'moderator']),
  },
  fields: [
    // ── Khối 1: Sidebar Quảng cáo dịch vụ (ảnh 9:16) ──
    {
      name: 'adSlider',
      type: 'group',
      label: '📢 Sidebar Quảng cáo dịch vụ (ảnh dọc 9:16)',
      admin: {
        description: 'Khối quảng cáo chạy bên cạnh danh sách tin tức ở Trang chủ (Desktop: bên phải, Mobile: bên dưới).',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Bật hiển thị Sidebar Quảng cáo dịch vụ',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề khối quảng cáo (tùy chọn)',
          defaultValue: 'DỊCH VỤ NỔI BẬT',
          admin: {
            placeholder: 'VD: DỊCH VỤ NỔI BẬT, TIÊM CHỦNG VẮC XIN...',
          },
        },
        {
          name: 'autoplayInterval',
          type: 'number',
          label: 'Thời gian tự động chuyển ảnh (giây)',
          defaultValue: 5,
          min: 2,
          max: 30,
          admin: {
            description: 'Đặt 0 để tắt tự động chuyển. Mặc định: 5 giây.',
          },
        },
        {
          name: 'slides',
          type: 'array',
          label: 'Danh sách ảnh quảng cáo dịch vụ',
          labels: {
            singular: 'Ảnh quảng cáo',
            plural: 'Các ảnh quảng cáo',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Hình ảnh (Khuyến nghị tỉ lệ 9:16 dọc, vd: 1080x1920)',
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'Đường dẫn liên kết khi bấm vào ảnh',
              admin: {
                placeholder: 'VD: /goi-vac-xin, /dich-vu, https://...',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Mở liên kết ở Tab mới',
              defaultValue: false,
            },
            {
              name: 'altText',
              type: 'text',
              label: 'Mô tả ngắn / Chú thích ảnh (Alt text)',
            },
          ],
        },
      ],
    },

    // ── Khối 2: Banner cột bên trái (Dưới Menu dọc chuyên mục) ──
    {
      name: 'sidebarBanners',
      type: 'array',
      label: '🪧 Danh sách Banner bên trái (Dưới Menu dọc chuyên mục)',
      labels: {
        singular: 'Banner chuyên mục',
        plural: 'Các banner chuyên mục',
      },
      admin: {
        description: 'Các banner quảng cáo hoặc thông báo hiển thị ở cột bên trái của các trang chuyên mục.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Ảnh Banner',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Đường dẫn liên kết (Link)',
          admin: {
            placeholder: 'VD: /bai-viet/abc hoặc https://...',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Mở trong tab mới',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề banner (tùy chọn)',
        },
      ],
    },

    // ── Khối 3: Cài đặt Slider Banner Trang chủ ──
    {
      name: 'heroSlider',
      type: 'group',
      label: '⚙️ Cài đặt Slider Banner Trang chủ',
      admin: {
        description: 'Tùy chỉnh kích thước và hiệu ứng chuyển động cho Slider Banner trên cùng trang chủ.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'heroSliderSize',
              type: 'select',
              label: 'Kích thước Slider Banner trang chủ',
              options: [
                { label: 'Nhỏ (350px)', value: 'small' },
                { label: 'Vừa (500px)', value: 'medium' },
                { label: 'Lớn (650px)', value: 'large' },
                { label: 'Tùy chỉnh chiều cao', value: 'custom' },
              ],
              defaultValue: 'medium',
            },
            {
              name: 'heroSliderCustomHeight',
              type: 'number',
              label: 'Chiều cao tự gõ (px)',
              admin: {
                condition: (data) => data?.heroSlider?.heroSliderSize === 'custom',
                description: 'Nhập chiều cao tính bằng pixel (ví dụ: 500).',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'heroSliderEffect',
              type: 'select',
              label: 'Hiệu ứng chuyển ảnh Banner',
              options: [
                { label: '🔄 Trượt ngang (Slide)', value: 'slide' },
                { label: '✨ Mờ dần (Fade)', value: 'fade' },
                { label: '🔳 Thu phóng (Zoom)', value: 'zoom' },
                { label: '📦 Lật (Flip)', value: 'flip' },
              ],
              defaultValue: 'slide',
            },
            {
              name: 'heroSliderAutoplayDelay',
              type: 'number',
              label: 'Thời gian dừng ở mỗi ảnh (mili-giây)',
              defaultValue: 5000,
              admin: {
                description: '1 giây = 1000 mili-giây. Mặc định: 5000 (5 giây).',
              },
            },
          ],
        },
        {
          name: 'heroSliderAutoplay',
          type: 'checkbox',
          label: 'Bật tự động trượt ảnh Banner',
          defaultValue: true,
        },
      ],
    },
  ],
};
