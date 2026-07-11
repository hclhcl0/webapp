import type { GlobalConfig } from 'payload';

export const ServicesLanding: GlobalConfig = {
  slug: 'servicesLanding',
  label: 'Cấu hình Landing Dịch vụ',
  admin: {
    group: 'Dịch vụ sản phẩm',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Phần đầu trang (Hero)',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề chính',
          required: true,
          defaultValue: 'Chăm sóc sức khỏe toàn diện',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: 'Đoạn mô tả phụ',
          defaultValue: 'Nhanh chóng, An toàn, Chuyên nghiệp',
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hình nền',
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Vì sao chọn chúng tôi? (Features)',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Biểu tượng (Tên Icon Lucide hoặc Emoji)',
        },
      ],
    },
    {
      name: 'process',
      type: 'array',
      label: 'Quy trình thực hiện',
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tên bước',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả chi tiết',
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Câu hỏi thường gặp (FAQ)',
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Câu hỏi',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Câu trả lời',
          required: true,
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Cài đặt Khối Tư vấn cuối trang (CTA)',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề',
          defaultValue: 'Bạn cần tư vấn thêm?',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả',
          defaultValue: 'Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn lựa chọn dịch vụ phù hợp nhất.',
        },
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Số điện thoại',
          defaultValue: '1900 1234',
        },
      ],
    },
  ],
};
