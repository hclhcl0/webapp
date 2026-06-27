import type { Block } from 'payload';

export const LivestreamBlock: Block = {
  slug: 'livestreamBlock',
  interfaceName: 'LivestreamBlock',
  labels: {
    singular: '🔴 Trực tiếp (Livestream)',
    plural: 'Trực tiếp (Livestream)',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên sự kiện đang Trực tiếp',
      defaultValue: 'Tường thuật trực tiếp',
    },
    {
      name: 'platform',
      type: 'select',
      label: 'Nền tảng phát sóng',
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Facebook', value: 'facebook' },
      ],
    },
    {
      name: 'videoId',
      type: 'text',
      label: 'Video ID (YouTube) hoặc URL (Facebook)',
      required: true,
      admin: {
        description: 'VD Youtube: v=dQw4w9WgXcQ thì nhập dQw4w9WgXcQ. VD Facebook: copy nguyên đường link video.',
      },
    },
    {
      name: 'status',
      type: 'radio',
      label: 'Trạng thái',
      defaultValue: 'live',
      options: [
        { label: 'Đang phát sóng (Nhấp nháy đỏ)', value: 'live' },
        { label: 'Sắp diễn ra', value: 'upcoming' },
        { label: 'Đã kết thúc', value: 'ended' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Tóm tắt nội dung (tùy chọn)',
    },
  ],
};
