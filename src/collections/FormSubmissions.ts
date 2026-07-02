import type { CollectionConfig } from 'payload';

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: 'Phản hồi / Liên hệ',
    plural: 'Danh sách Phản hồi / Liên hệ',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'createdAt', 'status'],
    group: 'Quản lý',
    description: 'Lưu trữ các phản hồi và yêu cầu liên hệ từ người dùng.',
  },
  access: {
    read: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    create: () => true, // Public — cho phép gửi form liên hệ từ website
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'new',
      options: [
        { label: '🆕 Mới', value: 'new' },
        { label: '👁️ Đã đọc', value: 'read' },
        { label: '✅ Đã xử lý', value: 'resolved' },
        { label: '🗑️ Spam', value: 'spam' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subject',
      type: 'select',
      label: 'Chủ đề liên hệ',
      required: true,
      options: [
        { label: 'Góp ý / Phản hồi dịch vụ', value: 'feedback' },
        { label: 'Hỏi thông tin dịch vụ y tế', value: 'medical_info' },
        { label: 'Báo cáo sự cố / Dịch bệnh', value: 'report' },
        { label: 'Yêu cầu hợp tác / Truyền thông', value: 'cooperation' },
        { label: 'Khác', value: 'other' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Địa chỉ Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Số điện thoại',
    },
    {
      name: 'organization',
      type: 'text',
      label: 'Cơ quan / Đơn vị (tùy chọn)',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Nội dung',
      required: true,
    },
    {
      name: 'adminNote',
      type: 'textarea',
      label: 'Ghi chú nội bộ (Admin)',
      admin: {
        description: 'Ghi chú này chỉ hiển thị với Admin, không gửi cho người dùng.',
        rows: 3,
      },
    },
  ],
  timestamps: true,
};
