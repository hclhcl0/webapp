import type { Block } from 'payload';

export const FaqBlock: Block = {
  slug: 'faqBlock',
  interfaceName: 'FaqBlock',
  labels: {
    singular: '❓ Hỏi & Đáp (FAQ)',
    plural: 'Hỏi & Đáp',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề phần (tùy chọn)',
      defaultValue: 'Câu hỏi thường gặp',
    },
    {
      name: 'faqs',
      type: 'array',
      label: 'Danh sách câu hỏi',
      minRows: 1,
      maxRows: 20,
      labels: { singular: 'Câu hỏi', plural: 'Các câu hỏi' },
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
          admin: { rows: 4 },
        },
      ],
    },
  ],
};
