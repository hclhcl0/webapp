import type { GlobalConfig } from 'payload';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cài đặt trang web',
  admin: {
    group: 'Cài đặt giao diện',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }: any) => user?.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        const convertMongoIDsToInteger = (obj: any) => {
          if (Array.isArray(obj)) {
            obj.forEach(convertMongoIDsToInteger);
          } else if (obj !== null && typeof obj === 'object') {
            if (typeof obj.id === 'string' && obj.id.length === 24) {
              // Convert the first 8 characters of the Mongo ID to a positive integer
              const parsed = parseInt(obj.id.substring(0, 8), 16);
              obj.id = isNaN(parsed) ? Math.floor(Math.random() * 2147483647) : parsed;
            }
            Object.values(obj).forEach(convertMongoIDsToInteger);
          }
        };
        if (data) convertMongoIDsToInteger(data);
        if (req?.body) convertMongoIDsToInteger(req.body);
        return data;
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────
        // TAB 1: HEADER
        // ─────────────────────────────────────────────
        {
          label: 'Header',
          name: 'header',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng',
              label: 'Tên Website',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'logoCustomization',
              type: 'group',
              label: 'Tùy chỉnh Logo',
              fields: [
                {
                  name: 'logoHeight',
                  type: 'number',
                  label: 'Chiều cao Logo (px)',
                  defaultValue: 80,
                  min: 20,
                  max: 200,
                  admin: {
                    description: 'Điều chỉnh chiều cao logo. Chiều rộng sẽ tự động co giãn theo tỷ lệ.',
                  },
                },
                {
                  name: 'logoPosition',
                  type: 'select',
                  label: 'Căn chỉnh Logo',
                  defaultValue: 'left',
                  options: [
                    { label: '⬅ Căn trái', value: 'left' },
                    { label: '⬛ Căn giữa', value: 'center' },
                    { label: '➡ Căn phải', value: 'right' },
                  ],
                },
                {
                  name: 'showSiteName',
                  type: 'checkbox',
                  label: 'Hiển thị tên website bên cạnh Logo',
                  defaultValue: true,
                },
                {
                  name: 'siteNameLine1',
                  type: 'text',
                  label: 'Dòng chữ thứ nhất bên cạnh Logo',
                  defaultValue: 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
                  admin: {
                    condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                  },
                },
                {
                  name: 'siteNameLine2',
                  type: 'text',
                  label: 'Dòng chữ thứ hai bên cạnh Logo',
                  defaultValue: 'THÀNH PHỐ ĐÀ NẴNG',
                  admin: {
                    condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                  },
                },
                {
                  name: 'siteTagline',
                  type: 'text',
                  label: 'Slogan / Tagline (bên dưới tên website)',
                  defaultValue: 'Phòng bệnh chủ động-vươn rộng tương lai',
                  admin: {
                    description: 'Dòng phụ nhỏ hiển thị bên dưới tên website. Để trống nếu không cần.',
                    condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                  },
                },
                {
                  name: 'logoBannerImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Hình ảnh bên dưới Logo (không bắt buộc)',
                  admin: {
                    description: 'Ảnh phụ nhỏ hiển thị bên dưới logo.',
                  },
                },
                {
                  name: 'mobileLogo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo riêng trên Điện thoại (Không bắt buộc)',
                },
                {
                  name: 'mobileLogoHeight',
                  type: 'number',
                  label: 'Chiều cao Logo trên Điện thoại (px)',
                  defaultValue: 40,
                  min: 15,
                  max: 100,
                },
                {
                  name: 'logoHoverEffect',
                  type: 'select',
                  label: 'Hiệu ứng rê chuột vào Logo (Hover)',
                  defaultValue: 'bounce',
                  options: [
                    { label: 'Không có hiệu ứng', value: 'none' },
                    { label: 'Phóng to & nghiêng (Scale & Tilt)', value: 'scale-tilt' },
                    { label: 'Phóng to & phát sáng (Scale & Glow)', value: 'glow' },
                    { label: 'Nhảy nhẹ lên (Bounce)', value: 'bounce' },
                  ],
                },
                {
                  name: 'mobileShowSiteName',
                  type: 'checkbox',
                  label: 'Hiển thị tên website cạnh Logo trên Điện thoại',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'searchCustomization',
              type: 'group',
              label: 'Tùy chỉnh Ô Tìm Kiếm',
              fields: [
                {
                  name: 'position',
                  type: 'select',
                  label: 'Vị trí đặt ô Tìm kiếm',
                  defaultValue: 'navbar',
                  options: [
                    { label: '⬇ Trong thanh Hotline (Mặc định)', value: 'hotline' },
                    { label: '➡ Trên thanh điều hướng chính (MainMenu)', value: 'navbar' },
                    { label: '➡ Bên phải thanh Menu điều hướng', value: 'menu' },
                    { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
                    { label: '❌ Ẩn nút tìm kiếm', value: 'hidden' },
                  ],
                },
                {
                  name: 'style',
                  type: 'select',
                  label: 'Cách hiển thị',
                  defaultValue: 'popup',
                  options: [
                    { label: '🔍 Ô nhập trực tiếp (Inline Input)', value: 'inline' },
                    { label: '📱 Nút icon kích hoạt Popup (Search Popup)', value: 'popup' },
                  ],
                },
                {
                  name: 'width',
                  type: 'number',
                  label: 'Chiều rộng ô nhập trực tiếp (px)',
                  defaultValue: 250,
                  min: 150,
                  max: 600,
                },
              ],
            },
            {
              name: 'hotline',
              type: 'group',
              label: 'Đường dây nóng (Hotline Bar)',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Số điện thoại',
                  defaultValue: '0236 3890 407',
                },
                {
                  name: 'actionLink',
                  type: 'text',
                  label: 'Link Nút "Đặt câu hỏi"',
                  defaultValue: '#',
                },
                {
                  name: 'position',
                  type: 'select',
                  label: 'Vị trí Hotline Bar',
                  defaultValue: 'topbar',
                  options: [
                    { label: '⬇ Dưới thanh điều hướng (Mặc định)', value: 'below-nav' },
                    { label: '⬆ Trên thanh điều hướng (Dưới TopBar)', value: 'above-nav' },
                    { label: '🔝 Trên cùng của trang (Trên cả TopBar)', value: 'very-top' },
                    { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
                  ],
                },
              ],
            },
            {
              name: 'socialLinks',
              type: 'group',
              label: 'Mạng xã hội (Top Bar)',
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook URL' },
                { name: 'youtube', type: 'text', label: 'Youtube URL' },
                { name: 'twitter', type: 'text', label: 'Twitter URL' },
                { name: 'instagram', type: 'text', label: 'Instagram URL' },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────
        // TAB 2: MENU ĐIỀU HƯỚNG
        // ─────────────────────────────────────────────
        {
          label: 'Menu Điều Hướng',
          name: 'menu',
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
              },
            },
            {
              name: 'menuItems',
              type: 'array',
              label: 'Danh sách Menu',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'Tên Menu',
                },
                {
                  name: 'presetUrl',
                  type: 'select',
                  label: '📌 Chọn trang có sẵn (tùy chọn)',
                  options: [
                    { label: '🏠 Trang chủ', value: '/' },
                    { label: '📰 Tất cả Bài viết', value: '/bai-viet' },
                    { label: '🩺 Sức khỏe cộng đồng', value: '/suc-khoe' },
                    { label: '📄 Văn bản điều hành', value: '/documents' },
                    { label: '📋 Thủ tục hành chính', value: '/procedures' },
                    { label: '🛒 Mua sắm & Đấu thầu', value: '/mua-sam' },
                    { label: '🏥 Dịch vụ y tế', value: '/dich-vu' },
                    { label: '🎬 Video truyền thông', value: '/video' },
                    { label: '📅 Lịch công tác', value: '/lich-cong-tac' },
                    { label: '📞 Liên hệ', value: '/contact' },
                    { label: '🔍 Tìm kiếm', value: '/search' },
                  ],
                  admin: {
                    description: 'Chọn một trang nội bộ có sẵn để tự điền đường dẫn. Nếu cần URL khác, điền thủ công bên dưới.',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn tùy chỉnh (để trống nếu đã chọn trang có sẵn bên trên)',
                  admin: {
                    description: 'Dùng khi URL không có trong danh sách: /chuyen-muc/phong-chong-dich hoặc https://...',
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
                    { name: 'label', type: 'text', required: true, label: 'Tên mục con' },
                    {
                      name: 'presetUrl',
                      type: 'select',
                      label: '📌 Chọn trang có sẵn (tùy chọn)',
                      options: [
                        { label: '🏠 Trang chủ', value: '/' },
                        { label: '📰 Tất cả Bài viết', value: '/bai-viet' },
                        { label: '🩺 Sức khỏe cộng đồng', value: '/suc-khoe' },
                        { label: '📄 Văn bản điều hành', value: '/documents' },
                        { label: '📋 Thủ tục hành chính', value: '/procedures' },
                        { label: '🛒 Mua sắm & Đấu thầu', value: '/mua-sam' },
                        { label: '🏥 Dịch vụ y tế', value: '/dich-vu' },
                        { label: '🎬 Video truyền thông', value: '/video' },
                        { label: '📅 Lịch công tác', value: '/lich-cong-tac' },
                        { label: '📞 Liên hệ', value: '/contact' },
                        { label: '🔍 Tìm kiếm', value: '/search' },
                      ],
                      admin: {
                        description: 'Chọn một trang nội bộ có sẵn để tự điền đường dẫn.',
                      },
                    },
                    { name: 'url', type: 'text', label: 'Đường dẫn tùy chỉnh' },
                    { name: 'openInNewTab', type: 'checkbox', label: 'Mở trong tab mới', defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────
        // TAB 3: SIDEBAR
        // ─────────────────────────────────────────────
        {
          label: 'Sidebar',
          name: 'sidebar',
          fields: [
            {
              name: 'widthRatio',
              type: 'select',
              required: true,
              defaultValue: 'Sidebar 33% - Main 67%',
              options: [
                { label: 'Sidebar 25% - Main 75%', value: 'Sidebar 25% - Main 75%' },
                { label: 'Sidebar 33% - Main 67%', value: 'Sidebar 33% - Main 67%' },
                { label: 'Sidebar 50% - Main 50%', value: 'Sidebar 50% - Main 50%' },
              ],
              label: 'Tỷ lệ chiều rộng',
            },
            {
              name: 'gapSize',
              type: 'select',
              required: true,
              defaultValue: 'Vừa',
              options: [
                { label: 'Không khoảng cách', value: 'Không khoảng cách' },
                { label: 'Nhỏ', value: 'Nhỏ' },
                { label: 'Vừa', value: 'Vừa' },
                { label: 'Lớn', value: 'Lớn' },
              ],
              label: 'Khoảng cách (Gap)',
            },
            {
              name: 'blocks',
              type: 'blocks',
              blocks: [CategoryNewsBlock],
              label: 'Các khối nội dung Sidebar',
            },
          ],
        },

        // ─────────────────────────────────────────────
        // TAB 4: CHÂN TRANG
        // ─────────────────────────────────────────────
        {
          label: 'Chân trang',
          name: 'footer',
          fields: [
            {
              name: 'aboutText',
              type: 'textarea',
              label: 'Đoạn giới thiệu ngắn (Hiển thị ở Footer)',
              defaultValue: '',
            },
            {
              name: 'addressMain',
              type: 'text',
              label: 'Trụ sở chính',
              defaultValue: '',
            },
            {
              name: 'addressSub',
              type: 'text',
              label: 'Cơ sở 2',
              defaultValue: '',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Số điện thoại',
              defaultValue: '',
            },
            {
              name: 'email',
              type: 'text',
              label: 'Email',
              defaultValue: '',
            },
            {
              name: 'quickLinks',
              type: 'array',
              label: 'Liên kết nhanh',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Tên' },
                { name: 'url', type: 'text', required: true, label: 'URL' },
              ],
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Mạng xã hội (Các kênh truyền thông)',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  label: 'Nền tảng',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Zalo', value: 'zalo' },
                    { label: 'Website khác', value: 'website' },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Tên kênh',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn (URL)',
                  required: true,
                },
              ],
            },
            {
              name: 'copyrightText',
              type: 'text',
              label: 'Dòng bản quyền (Copyright)',
              defaultValue: '© Bản quyền thuộc về TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG',
              admin: {
                description: 'Sử dụng {year} để tự động hiển thị năm hiện tại.',
              },
            },
            {
              name: 'designerCredit',
              type: 'text',
              label: 'Thông tin thiết kế',
              defaultValue: 'thiết kế bởi CNTT CDC Đà Nẵng',
            },
          ],
        },

        // ─────────────────────────────────────────────
        // TAB 5: GIAO DIỆN
        // ─────────────────────────────────────────────
        {
          label: 'Giao diện',
          name: 'theme',
          fields: [
            {
              name: 'orgLayout',
              type: 'select',
              label: 'Kiểu hiển thị trang Cơ cấu tổ chức',
              defaultValue: 'chart_accordion',
              admin: {
                description: 'Thay đổi sẽ có hiệu lực ngay trên trang web.',
              },
              options: [
                { label: '🏛️ Sơ đồ + Danh sách (mặc định)', value: 'chart_accordion' },
                { label: '📁 Thẻ danh sách (Card Grid)', value: 'card_grid' },
                { label: '📋 Bảng đơn giản (Simple Table)', value: 'simple_table' },
                { label: '🗂️ Tabs theo nhóm', value: 'tabs' },
                { label: '🌳 Chỉ Sơ đồ Org Chart', value: 'chart_only' },
              ],
            },
            {
              name: 'orgColors',
              type: 'group',
              label: 'Màu sắc Cơ cấu tổ chức',
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
