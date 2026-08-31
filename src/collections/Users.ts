import type { CollectionConfig } from 'payload';

/** Các vai trò mà Biên tập viên được phép tạo / quản lý */
const EDITOR_MANAGEABLE_ROLES = ['editor', 'author', 'user'];

const getRole = (user: any): string | null => {
  if (!user) return null;
  const r = Array.isArray(user?.role) ? user.role[0] : user?.role;
  return typeof r === 'string' ? r.toLowerCase() : null;
};

const isAdmin = ({ req: { user } }: any) => getRole(user) === 'admin';
const isAdminOrEditor = ({ req: { user } }: any) => ['admin', 'editor'].includes(getRole(user) ?? '');

const canUpdateRole = ({ req: { user }, id }: any) => {
  const role = getRole(user);
  if (role === 'admin') return true;
  if (role === 'editor') {
    // Editor không được tự đổi role của chính mình
    if (user?.id === id) return false;
    return true;
  }
  return false;
};

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Tài khoản',
    plural: 'Danh sách tài khoản',
  },
  admin: {
    useAsTitle: 'username',
    group: 'Quản trị hệ thống',
    // Admin: xem toàn bộ menu. Editor: cũng thấy menu để tạo/quản lý CTV
    hidden: ({ user }: any) => {
      const role = getRole(user);
      return role !== 'admin' && role !== 'editor';
    },
    defaultColumns: ['username', 'name', 'role', 'department', 'createdAt'],
    components: {
      beforeList: [
        '@/components/Admin/UserPermissionsNote.tsx#UserPermissionsNote',
      ],
    },
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
    },
    maxLoginAttempts: 10000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax',
    },
    tokenExpiration: 28800, // 8 tiếng
  },
  access: {
    // Vào được Admin panel: mọi role trừ 'user'
    admin: ({ req: { user } }) => {
      const role = getRole(user);
      return !!role && role !== 'user';
    },

    // ── READ ──────────────────────────────────────────────────────────────
    read: ({ req: { user } }) => {
      if (!user) return false;
      const role = getRole(user);
      if (role === 'admin') return true;
      // Editor: xem được tài khoản editor / author / user (không thấy admin / moderator)
      if (role === 'editor') {
        return {
          or: [
            { id: { equals: user.id } },                // luôn xem được mình
            { role: { in: EDITOR_MANAGEABLE_ROLES } },  // và cấp thấp hơn / ngang
          ],
        };
      }
      // Các role khác: chỉ xem chính mình
      return { id: { equals: user.id } };
    },

    // ── CREATE ────────────────────────────────────────────────────────────
    create: ({ req: { user } }) => {
      if (!user) return true; // first-user seed
      const role = getRole(user);
      return role === 'admin' || role === 'editor';
    },

    // ── UPDATE ────────────────────────────────────────────────────────────
    update: ({ req: { user } }) => {
      if (!user) return false;
      const role = getRole(user);
      if (role === 'admin') return true;
      // Editor: sửa tài khoản editor / author / user và chính mình
      if (role === 'editor') {
        return {
          or: [
            { id: { equals: user.id } },
            { role: { in: EDITOR_MANAGEABLE_ROLES } },
          ],
        };
      }
      return { id: { equals: user.id } };
    },

    // ── DELETE ────────────────────────────────────────────────────────────
    delete: ({ req: { user } }) => {
      if (!user) return false;
      const role = getRole(user);
      if (role === 'admin') return true;
      // Editor: chỉ xóa author / user (không xóa editor khác, không xóa chính mình)
      if (role === 'editor') {
        return { role: { in: ['author', 'user'] } };
      }
      return false;
    },
  },

  // ── HOOK: Chặn Editor tạo/sửa tài khoản vượt phạm vi ─────────────────
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        const actorRole = getRole(req.user);
        if (actorRole === 'editor') {
          // Editor không được đặt role cao hơn editor (admin/moderator)
          if (data.role && !EDITOR_MANAGEABLE_ROLES.includes(data.role)) {
            data.role = 'author'; // reset về author nếu cố tình set cao hơn
          }
          // Editor không được tự gán allowedModules / allowedCategories / department
          if (operation === 'create' || operation === 'update') {
            delete data.allowedModules;
            delete data.allowedCategories;
            delete data.department;
          }
        }
        return data;
      },
    ],
  },

  fields: [
    // ── Role ────────────────────────────────────────────────────────────
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
        // Admin: đổi mọi role. Editor: chỉ sửa role của CTV cấp dưới (không tự sửa mình)
        update: canUpdateRole,
        create: isAdminOrEditor,
      },
      admin: {
        position: 'sidebar',
        description: 'Admin: chọn tất cả. Biên tập viên: chỉ tạo được Editor / Author / User.',
      },
    },

    // ── Department ──────────────────────────────────────────────────────
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      label: 'Phòng / Khoa / Bộ phận',
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        position: 'sidebar',
        description: 'Chỉ Admin mới có quyền phân công phòng ban.',
      },
    },

    // ── Tên ─────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
    },

    // ── allowedCategories ────────────────────────────────────────────────
    {
      name: 'allowedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Chuyên mục bài viết được phân công',
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        description: 'Chỉ Admin mới có quyền phân công. Để trống = không giới hạn chuyên mục.',
        position: 'sidebar',
        condition: (data: any) => ['editor', 'moderator', 'author'].includes(data?.role),
      },
    },

    // ── allowedModules ───────────────────────────────────────────────────
    {
      name: 'allowedModules',
      type: 'select',
      hasMany: true,
      label: 'Chức năng / Module được phân công',
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        description: 'Chỉ Admin mới có quyền phân công. Để trống = toàn quyền theo vai trò.',
        position: 'sidebar',
        condition: (data: any) => ['editor', 'moderator', 'author'].includes(data?.role),
      },
      options: [
        // ── 📰 Báo chí & Truyền thông ──
        { label: '📰 [Báo chí & Tin tức] Bài viết & Tin tức', value: 'articles' },
        { label: '🗂️ [Báo chí & Tin tức] Chuyên mục & Thẻ bài viết', value: 'categories' },
        { label: '🖼️ [Báo chí & Tin tức] Thư viện Hình ảnh / Media', value: 'media' },
        { label: '🎬 [Báo chí & Tin tức] Video & Kênh Video', value: 'videos' },
        { label: '🖼️ [Báo chí & Tin tức] Banner & Sidebar Quảng cáo', value: 'banners' },

        // ── 💉 Dịch vụ Y tế & Tiêm chủng ──
        { label: '💉 [Dịch vụ Y tế] Vắc xin & Gói tiêm chủng', value: 'vaccines' },
        { label: '📝 [Dịch vụ Y tế] Khách hàng đăng ký tiêm / Liên hệ', value: 'form-submissions' },

        // ── 🏛️ Thông tin Đơn vị & Pháp quy ──
        { label: '📄 [Pháp quy] Văn bản & Người ký văn bản', value: 'documents' },
        { label: '🏗️ [Pháp quy] Mua sắm & Đấu thầu công', value: 'procurements' },
        { label: '📑 [Đơn vị] Các trang nội dung tĩnh (Giới thiệu...)', value: 'pages' },
        { label: '🏛️ [Đơn vị] Cơ cấu tổ chức / Ban lãnh đạo', value: 'org-units' },

        // ── 🤖 Kỹ thuật & AI ──
        { label: '🤖 [Kỹ thuật] Kho Tri thức Trợ lý ảo AI', value: 'ai-knowledge' },
      ],
    },
  ],
};


