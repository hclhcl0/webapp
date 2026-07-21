import type { Block } from 'payload';

export const ScheduleBlock: Block = {
  slug: 'scheduleBlock',
  interfaceName: 'ScheduleBlock',
  labels: {
    singular: '📅 Lịch làm việc (Schedule)',
    plural: '📅 Lịch làm việc',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề chính',
      required: true,
      defaultValue: 'LỊCH LÀM VIỆC',
      admin: {
        description: 'Ví dụ: LỊCH TIÊM CHỦNG, LỊCH KHÁM BỆNH...',
      }
    },
    {
      name: 'icon',
      type: 'select',
      label: 'Biểu tượng (Icon)',
      defaultValue: 'calendar',
      options: [
        { label: '📅 Lịch', value: 'calendar' },
        { label: '💉 Ống tiêm (Tiêm chủng)', value: 'syringe' },
        { label: '🔬 Kính hiển vi (Xét nghiệm)', value: 'microscope' },
        { label: '🏥 Bệnh viện', value: 'hospital' },
        { label: '🩺 Ống nghe (Khám bệnh)', value: 'stethoscope' },
      ],
    },
    {
      name: 'scheduleGroups',
      type: 'array',
      label: 'Các nhóm Lịch làm việc',
      minRows: 1,
      admin: {
        description: 'Thêm các nhóm ngày (Ví dụ: Từ Thứ 2 đến Thứ 6).',
      },
      fields: [
        {
          name: 'groupTitle',
          type: 'text',
          label: 'Tên nhóm ngày',
          required: true,
          admin: {
            placeholder: 'VD: Từ thứ 2 đến thứ 6',
          }
        },
        {
          name: 'timeSlots',
          type: 'array',
          label: 'Các ca làm việc',
          minRows: 1,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Nhãn (Sáng/Chiều)',
                  required: true,
                  admin: {
                    width: '30%',
                    placeholder: 'VD: Buổi sáng',
                  }
                },
                {
                  name: 'time',
                  type: 'text',
                  label: 'Khung giờ',
                  required: true,
                  admin: {
                    width: '70%',
                    placeholder: 'VD: 7:15 - 11:00',
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'highlightBox',
      type: 'group',
      label: 'Hộp Lưu ý nổi bật (Highlight Box)',
      admin: {
        description: 'Hộp màu vàng/cam nổi bật để ghi thời gian lấy số thứ tự hoặc lưu ý đặc biệt.',
      },
      fields: [
        {
          name: 'showHighlight',
          type: 'checkbox',
          label: 'Hiển thị hộp lưu ý',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề hộp',
          defaultValue: 'Thời gian lấy số thứ tự:',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.showHighlight),
          }
        },
        {
          name: 'content',
          type: 'array',
          label: 'Nội dung liệt kê',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.showHighlight),
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
              admin: { placeholder: 'VD: Buổi sáng: Bắt đầu từ 7:00' }
            }
          ]
        }
      ]
    },
    {
      name: 'bottomNote',
      type: 'text',
      label: 'Ghi chú dưới cùng (tuỳ chọn)',
      admin: {
        description: 'Ví dụ: * Mỗi khách hàng chỉ lấy 01 số thứ tự',
      }
    }
  ],
};
