import type { GlobalConfig } from 'payload';

const PRESET_URLS = [
  { label: '── Trang chính ──', value: '' },
  { label: '🏠 Trang chủ', value: '/' },
  { label: '📞 Liên hệ', value: '/contact' },
  { label: '🔍 Tìm kiếm', value: '/search' },
  { label: '── Bài viết & Tin tức ──', value: '' },
  { label: '📰 Tất cả Bài viết', value: '/bai-viet' },
  { label: '🩺 Sức khỏe cộng đồng', value: '/suc-khoe' },
  { label: '── Văn bản & Hành chính ──', value: '' },
  { label: '📄 Văn bản điều hành', value: '/documents' },
  { label: '📋 Thủ tục hành chính', value: '/procedures' },
  { label: '🛒 Mua sắm & Đấu thầu', value: '/mua-sam' },
  { label: '── Dịch vụ ──', value: '' },
  { label: '🏥 Dịch vụ y tế', value: '/dich-vu' },
  { label: '── Truyền thông ──', value: '' },
  { label: '🎬 Video truyền thông', value: '/video' },
  { label: '📅 Lịch công tác', value: '/lich-cong-tac' },
];

export const MainMenu: GlobalConfig = {
  slug: 'main-menu',
  label: 'Menu Điều Hướng',
  admin: {
    group: 'Cài đặt giao diện',
  },
  access: {
    read: () => true,
    // Chỉ Admin mới được sửa menu điều hướng
    update: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'menuPosition',
      type: 'select',
      label: 'Vị trí Menu điều hướng',
      defaultValue: 'below',
      options: [
        { label: '➡ Bên phải Logo (cùng hàng)', value: 'right' },
        { label: '⬇ Thanh riêng bên dưới Logo', value: 'below' },
        { label: '⬅ Bên trái Logo (cùng hàng)', value: 'left' },
      ],
      admin: {
        description: 'Chọn nơi hiển thị thanh menu điều hướng chính.',
      }
    },
    {
      name: 'menuItems',
      type: 'array',
      label: 'Danh sách Menu',
      defaultValue: [
        { label: 'Home', url: '/' },
        { label: 'Giới thiệu', url: '/category/gioi-thieu/' },
        { label: 'Sức khỏe', url: '/suc-khoe' },
        { label: 'Dịch vụ', url: '/category/hoat-dong-dich-vu/' },
        { label: 'Đào tạo', url: '/category/dao-tao/' },
        { label: 'Công đoàn', url: '/category/hoat-dong-cong-doan/' },
        { label: 'Mua sắm', url: '/category/thong-tin-mua-sam/' },
        { label: 'Hành chính', url: '#' },
        { label: 'Liên Hệ', url: '/lien-he.html' }
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Tên Menu (Ví dụ: Giới thiệu)',
        },
        {
          name: 'presetUrl',
          type: 'select',
          label: '📌 Chọn trang có sẵn (tùy chọn)',
          options: PRESET_URLS,
          admin: {
            description: 'Chọn một trang nội bộ có sẵn để tự điền đường dẫn. Nếu cần đường dẫn tùy chỉnh, hãy điền thủ công bên dưới.',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Đường dẫn tùy chỉnh (hoặc để trống nếu chỉ là tiêu đề nhóm)',
          admin: {
            description: 'Nhập đường dẫn thủ công nếu không tìm thấy trang trong danh sách bên trên. Ví dụ: /chuyen-muc/phong-chong-dich, https://example.com',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Mở trong tab mới',
          defaultValue: false,
        },
        {
          name: 'subItems',
          type: 'array',
          label: 'Menu Con (Dropdown)',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Tên mục con',
            },
            {
              name: 'presetUrl',
              type: 'select',
              label: '📌 Chọn trang có sẵn (tùy chọn)',
              options: PRESET_URLS,
              admin: {
                description: 'Chọn một trang nội bộ có sẵn để tự điền đường dẫn.',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'Đường dẫn tùy chỉnh',
              admin: {
                description: 'Nhập thủ công nếu không tìm thấy trong danh sách bên trên.',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Mở trong tab mới',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
};

