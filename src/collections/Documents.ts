import type { CollectionConfig } from 'payload';

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Văn bản',
    plural: 'Văn bản',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['documentNumber', 'title', 'documentType', 'publishedDate', 'issuer'],
    group: 'Nội dung',
    description: '👉 Đường dẫn xem trên website: /documents',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
  },
  fields: [
    {
      name: 'documentNumber',
      type: 'text',
      required: true,
      label: 'Số kí hiệu',
      admin: {
        placeholder: 'VD: 2042/TB-TTKSBT',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Trích yếu (Tên văn bản)',
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      label: 'Ngày ban hành',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'effectiveDate',
      type: 'date',
      label: 'Ngày bắt đầu hiệu lực',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      label: 'Ngày hết hiệu lực',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'documentType',
      type: 'select',
      label: 'Thể loại',
      options: [
        { label: 'Chỉ thị', value: 'chi-thi' },
        { label: 'Quyết định', value: 'quyet-dinh' },
        { label: 'Nghị định', value: 'nghi-dinh' },
        { label: 'Công văn', value: 'cong-van' },
        { label: 'Thông báo', value: 'thong-bao' },
        { label: 'Thông tư', value: 'thong-tu' },
        { label: 'Kế hoạch', value: 'ke-hoach' },
        { label: 'Báo cáo', value: 'bao-cao' },
        { label: 'Hướng dẫn', value: 'huong-dan' },
        { label: 'Khác', value: 'khac' },
      ],
    },
    {
      name: 'field',
      type: 'text',
      label: 'Lĩnh vực',
      admin: {
        placeholder: 'VD: Y tế, Thông báo thầu, Phòng chống dịch...',
      },
    },
    {
      name: 'issuer',
      type: 'text',
      required: true,
      label: 'Cơ quan ban hành',
      defaultValue: 'Trung tâm Kiểm soát bệnh tật Đà Nẵng',
    },
    {
      name: 'signer',
      type: 'text',
      label: 'Người ký (Dữ liệu cũ)',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'signerRef',
      type: 'relationship',
      relationTo: 'document-signers',
      hasMany: false,
      label: 'Người ký',
      admin: {
        description: 'Chọn từ danh sách hoặc bấm dấu + để lưu người mới',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'File đính kèm (PDF/DOCX) — Tải lên trực tiếp',
      admin: {
        description: 'Tải file lên trực tiếp. Nếu đã có link Google Drive bên dưới thì có thể bỏ qua ô này.',
      },
    },
    {
      name: 'driveUrl',
      type: 'text',
      label: 'Link Google Drive (thay thế hoặc bổ sung)',
      admin: {
        placeholder: 'https://drive.google.com/file/d/xxxxxxx/view?usp=sharing',
        description: 'Dán link chia sẻ Google Drive. Hệ thống tự chuyển sang link tải về.',
      },
    },
  ],
};
