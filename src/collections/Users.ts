import type { CollectionConfig } from 'payload';

const isAdmin = ({ req: { user } }: any) => {
  if (!user) return false;
  const role = Array.isArray(user?.role) ? user.role[0]?.toLowerCase() : user?.role?.toLowerCase();
  return role === 'admin';
};

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Tài khoản',
    plural: 'Danh sách tài khoản',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Quản trị hệ thống',
    hidden: ({ user }: any) => {
      const role = Array.isArray(user?.role) ? user.role[0]?.toLowerCase() : user?.role?.toLowerCase();
      return role !== 'admin';
    },
    components: {
      beforeList: [
        '@/components/Admin/UserPermissionsNote.tsx#UserPermissionsNote',
      ],
    },
  },
  auth: {
    maxLoginAttempts: 10000, // Tạm thời vô hiệu hóa khóa tài khoản do bot tấn công
    cookies: {
      secure: process.env.NODE_ENV === 'production', // HTTPS production
      sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax',
    },
    tokenExpiration: 28800, // 8 tiếng
  },
  access: {
    admin: ({ req: { user } }) => {
      const role = Array.isArray(user?.role) ? user.role[0]?.toLowerCase() : user?.role?.toLowerCase();
      return role && role !== 'user';
    },
    // Chỉ Admin mới được xem và quản lý danh sách user, hoặc user tự xem chính mình
    read: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      if (role === 'admin') return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => {
      if (!user) return true; // Cho phép tạo user đầu tiên khi hệ thống trống, Payload tự xử lý logic first user.
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      return role === 'admin';
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      if (role === 'admin') return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      return role === 'admin';
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò / Quyền hạn',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Quản trị viên (Admin)', value: 'admin' },
        { label: 'Kiểm duyệt viên (Moderator)', value: 'moderator' },
        { label: 'Biên tập viên (Editor)', value: 'editor' },
        { label: 'Cộng tác viên/Tác giả (Author)', value: 'author' },
        { label: 'Người dùng (User)', value: 'user' },
      ],
      access: {
        // Chỉ admin mới được sửa quyền của người khác (và của chính mình)
        update: isAdmin,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      label: 'Phòng / Khoa / Bộ phận',
      access: {
        update: isAdmin,
      },
      admin: {
        position: 'sidebar',
        description: 'Chỉ Admin mới có quyền phân công phòng ban. Chỉ áp dụng cho Nhân viên/Tác giả.',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
    },
    {
      name: 'allowedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Chuyên mục bài viết được phân công',
      access: {
        // Chỉ admin mới có quyền phân công chuyên mục cho tài khoản
        update: isAdmin,
      },
      admin: {
        description: 'Chỉ Admin mới có quyền phân công. Để trống = không giới hạn chuyên mục (xem/sửa tất cả). Áp dụng cho Editor, Moderator và Author.',
        position: 'sidebar',
        condition: (data: any) => ['editor', 'moderator', 'author'].includes(data?.role),
      },
    },
    {
      name: 'allowedModules',
      type: 'select',
      hasMany: true,
      label: 'Chức năng / Module được phân công',
      access: {
        // Chỉ admin mới có quyền phân công module cho tài khoản
        update: isAdmin,
      },
      admin: {
        description: 'Chỉ Admin mới có quyền phân công. Để trống = toàn quyền truy cập theo vai trò. Chọn cụ thể = chỉ hiển thị và cho phép thao tác trên các chức năng được chọn.',
        position: 'sidebar',
        condition: (data: any) => ['editor', 'moderator', 'author'].includes(data?.role),
      },
      options: [
        { label: '📰 Quản lý Bài viết', value: 'articles' },
        { label: '🎬 Quản lý Video & Kênh', value: 'videos' },
        { label: '💉 Quản lý Vắc xin & Gói Vắc xin', value: 'vaccines' },
        { label: '🤖 Kho Tri thức AI (Knowledge)', value: 'ai-knowledge' },
        { label: '🖼️ Quản lý Banner quảng cáo', value: 'banners' },
        { label: '📄 Quản lý Văn bản / Tài liệu', value: 'documents' },
        { label: '🏗️ Mua sắm & Đấu thầu', value: 'procurements' },
        { label: '📑 Quản lý Trang nội dung (Pages)', value: 'pages' },
        { label: '🏛️ Quản lý Cơ cấu tổ chức', value: 'org-units' },
        { label: '📝 Quản lý Form đăng ký / Liên hệ', value: 'form-submissions' },
        { label: '🖼️ Thư viện Hình ảnh / Media', value: 'media' },
        { label: '🗂️ Quản lý Chuyên mục & Thẻ', value: 'categories' },
      ],
    },
  ],
};
