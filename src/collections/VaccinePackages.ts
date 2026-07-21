import type { CollectionConfig } from 'payload';

export const VaccinePackages: CollectionConfig = {
  slug: 'vaccine-packages',
  labels: {
    singular: 'Gói Vắc Xin',
    plural: 'Gói Vắc Xin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'targetGroup', 'packageType', 'discountPrice', 'isActive'],
    group: 'Dịch vụ Y tế',
    description: 'Quản lý các gói combo vắc xin. Đường dẫn trang hiển thị trên web: /goi-vac-xin',
  },
  fields: [
    // ─── Thông tin cơ bản ───────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      label: 'Tên gói',
      required: true,
      admin: { description: 'VD: Gói Combo 6 Tháng, Gói Tiền Học Đường...' },
    },
    {
      name: 'targetGroup',
      type: 'text',
      label: 'Đối tượng / Độ tuổi',
      required: true,
      admin: { description: 'VD: 0-6 tháng tuổi, Trẻ 3-9 tuổi...' },
    },
    {
      name: 'packageType',
      type: 'select',
      label: 'Phân loại gói',
      required: true,
      defaultValue: 'by_age',
      options: [
        { label: 'Theo độ tuổi', value: 'by_age' },
        { label: 'Theo đối tượng', value: 'by_target' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình ảnh minh họa',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
      admin: { description: 'Hiển thị dưới tên gói trong sidebar' },
    },

    // ─── Giá ───────────────────────────────────────────────────
    {
      name: 'originalPrice',
      type: 'number',
      label: 'Giá gốc (VNĐ)',
      admin: { description: 'Giá trước khi giảm, để trống nếu không có' },
    },
    {
      name: 'discountPrice',
      type: 'number',
      label: 'Giá ưu đãi (VNĐ)',
      required: true,
      admin: { description: 'Giá thực tế hiển thị cho người dùng' },
    },
    {
      name: 'discountLabel',
      type: 'text',
      label: 'Nhãn khuyến mãi',
      admin: { description: 'VD: Giảm tới 616.690đ — hiển thị trên thẻ gói' },
    },

    // ─── Danh sách vắc xin trong gói ───────────────────────────
    {
      name: 'items',
      type: 'array',
      label: 'Danh sách vắc xin trong gói',
      minRows: 1,
      admin: {
        description: 'Thêm từng vắc xin vào gói, kèm số liều và phác đồ',
      },
      fields: [
        {
          name: 'vaccine',
          type: 'relationship',
          relationTo: 'vaccines',
          label: 'Vắc xin',
          required: true,
        },
        {
          name: 'diseaseName',
          type: 'text',
          label: 'Nhóm bệnh phòng (tiêu đề nhóm)',
          admin: {
            description: 'VD: Phòng bệnh Não mô cầu B — sẽ hiển thị như tiêu đề nhóm',
          },
        },
        {
          name: 'doses',
          type: 'number',
          label: 'Số liều',
          required: true,
          defaultValue: 1,
          min: 1,
        },
        {
          name: 'protocol',
          type: 'text',
          label: 'Phác đồ',
          admin: { description: 'VD: 2 Liều, 3 Liều...' },
        },
        {
          name: 'unitPrice',
          type: 'number',
          label: 'Đơn giá / liều (VNĐ)',
          admin: { description: 'Giá mỗi liều sau khuyến mãi trong gói' },
        },
        {
          name: 'originalUnitPrice',
          type: 'number',
          label: 'Đơn giá gốc / liều (VNĐ)',
          admin: { description: 'Giá gốc mỗi liều (hiển thị gạch ngang)' },
        },
      ],
    },

    // ─── Cài đặt ───────────────────────────────────────────────
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hơn hiển thị trước' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Hiển thị',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Gói nổi bật (mặc định được chọn)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
};
