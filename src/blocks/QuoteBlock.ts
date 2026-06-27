import type { Block } from 'payload';

export const QuoteBlock: Block = {
  slug: 'quoteBlock',
  interfaceName: 'QuoteBlock',
  labels: {
    singular: '💬 Trích dẫn nổi bật (Quote)',
    plural: 'Trích dẫn nổi bật',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Nội dung trích dẫn',
      admin: {
        rows: 4,
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Người nói (tùy chọn)',
    },
    {
      name: 'role',
      type: 'text',
      label: 'Chức vụ / Chú thích thêm',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.author),
      },
    },
  ],
};
