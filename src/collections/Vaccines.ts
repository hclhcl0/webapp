import type { CollectionConfig } from 'payload';

export const Vaccines: CollectionConfig = {
  slug: 'vaccines',
  labels: {
    singular: 'Vắc xin',
    plural: 'Danh mục Vắc xin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'disease', 'price', 'status'],
    group: 'Dịch vụ Y tế',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên Vắc xin',
      required: true,
      admin: {
        description: 'Tên thương mại của loại vắc xin (Ví dụ: Hexaxim, Infanrix Hexa)',
      },
    },
    {
      name: 'disease',
      type: 'text',
      label: 'Phòng bệnh',
      admin: {
        description: 'Các bệnh mà vắc xin này phòng ngừa (Ví dụ: Bạch hầu, ho gà, uốn ván...)',
      },
    },
    {
      name: 'targetGroup',
      type: 'text',
      label: 'Đối tượng',
      admin: {
        description: 'Độ tuổi hoặc đối tượng tiêm chủng (Ví dụ: Trẻ từ 2 tháng tuổi)',
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Giá (VNĐ)',
      admin: {
        description: 'Nhập số tiền (chỉ nhập số, ví dụ: 1050000)',
      },
    },
    {
      name: 'origin',
      type: 'text',
      label: 'Quốc gia / Hãng sản xuất',
      admin: {
        description: 'Nguồn gốc xuất xứ (Ví dụ: Pháp - Sanofi, Bỉ - GSK)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Tình trạng',
      defaultValue: 'in_stock',
      options: [
        { label: 'Còn vắc xin', value: 'in_stock' },
        { label: 'Hết vắc xin', value: 'out_of_stock' },
        { label: 'Liên hệ', value: 'contact' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Ghi chú',
      admin: {
        description: 'Các lưu ý thêm về liều tiêm, khoảng cách các mũi...',
      },
    },
  ],
};
