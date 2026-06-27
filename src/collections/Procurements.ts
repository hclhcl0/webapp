import type { CollectionConfig } from 'payload';

export const Procurements: CollectionConfig = {
  slug: 'procurements',
  labels: {
    singular: 'Thông tin mua sắm',
    plural: 'Thông tin mua sắm',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'procurementType', 'status', 'deadline', 'publishedDate'],
    group: 'Nội dung',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề',
      admin: {
        placeholder: 'VD: Thư mời chào giá về việc cung cấp dịch vụ bảo trì...',
      },
    },
    {
      name: 'documentNumber',
      type: 'text',
      label: 'Số hiệu văn bản',
      admin: {
        placeholder: 'VD: 2042/TM-TTKSBT',
      },
    },
    {
      name: 'procurementType',
      type: 'select',
      required: true,
      label: 'Loại',
      defaultValue: 'thu-moi-chao-gia',
      options: [
        { label: 'Thư mời chào giá',      value: 'thu-moi-chao-gia' },
        { label: 'Kết quả lựa chọn nhà thầu', value: 'ket-qua-lua-chon' },
        { label: 'Thông báo mời thầu',    value: 'moi-thau' },
        { label: 'Thông báo',             value: 'thong-bao' },
        { label: 'Báo cáo',               value: 'bao-cao' },
        { label: 'Khác',                  value: 'khac' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Trạng thái',
      defaultValue: 'open',
      options: [
        { label: '🟢 Đang mở',   value: 'open' },
        { label: '🔴 Đã đóng',   value: 'closed' },
        { label: '✅ Đã xét thầu', value: 'evaluated' },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      label: 'Ngày đăng',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        description: 'Ngày công bố thông tin',
      },
    },
    {
      name: 'deadline',
      type: 'date',
      label: 'Hạn nộp hồ sơ',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        description: 'Để trống nếu không có hạn nộp cụ thể',
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
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện (Thumbnail)',
      admin: {
        description: 'Ảnh bìa hiển thị ngoài danh sách dạng lưới.',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Ghi chú (tùy chọn)',
      admin: {
        placeholder: 'Thông tin bổ sung nếu cần...',
        rows: 2,
      },
    },
  ],
};
