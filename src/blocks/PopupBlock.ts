import type { Block } from 'payload';

export const PopupBlock: Block = {
  slug: 'popupBlock',
  interfaceName: 'PopupBlock',
  labels: {
    singular: '🪟 Cửa sổ Popup (Modal Popup)',
    plural: '🪟 Cửa sổ Popup',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'buttonText',
          type: 'text',
          label: 'Nhãn nút bấm mở Popup',
          required: true,
          defaultValue: '👉 Nhấp để xem chi tiết',
          admin: {
            description: 'Nút hiển thị trên bài viết để độc giả bấm mở cửa sổ Popup.',
            width: '60%',
          },
        },
        {
          name: 'buttonStyle',
          type: 'select',
          label: 'Kiểu dáng nút',
          defaultValue: 'primary',
          options: [
            { label: '🔵 Nút Xanh chủ đạo (Primary)', value: 'primary' },
            { label: '🔴 Nút Đỏ khẩn cấp / Cảnh báo (Danger)', value: 'danger' },
            { label: '🟠 Nút Cam nổi bật (Warning)', value: 'warning' },
            { label: '🟢 Nút Xanh lá (Success)', value: 'success' },
            { label: '⚪ Nút Viền sang trọng (Outline)', value: 'outline' },
            { label: '📦 Khối Banner hộp có viền (Card Box)', value: 'card' },
          ],
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonIcon',
          type: 'select',
          label: 'Biểu tượng (Icon)',
          defaultValue: '🔍',
          options: [
            { label: '🔍 Kính lúp (Tra cứu / Xem chi tiết)', value: '🔍' },
            { label: '📋 Bảng danh sách / Hồ sơ', value: '📋' },
            { label: 'ℹ️ Thông tin chi tiết', value: 'ℹ️' },
            { label: '💡 Gợi ý / Lưu ý', value: '💡' },
            { label: '⚠️ Cảnh báo quan trọng', value: '⚠️' },
            { label: '🚨 Khẩn cấp', value: '🚨' },
            { label: '💉 Tiêm chủng / Vắc xin', value: '💉' },
            { label: '🏥 Dịch vụ khám bệnh', value: '🏥' },
            { label: '🧪 Xét nghiệm', value: '🧪' },
            { label: '📄 Văn bản & Quy định', value: '📄' },
            { label: '📞 Hotline tư vấn', value: '📞' },
          ],
          admin: {
            width: '40%',
          },
        },
        {
          name: 'modalSize',
          type: 'select',
          label: 'Kích thước cửa sổ Popup',
          defaultValue: 'lg',
          options: [
            { label: 'Vừa phải (600px - max-w-xl)', value: 'md' },
            { label: 'Lớn (800px - max-w-3xl - Khuyên dùng)', value: 'lg' },
            { label: 'Rất rộng (1000px - max-w-5xl - Cho bảng biểu / nhiều ảnh)', value: 'xl' },
          ],
          admin: {
            width: '60%',
          },
        },
      ],
    },
    {
      name: 'modalTitle',
      type: 'text',
      label: 'Tiêu đề hiển thị trên thanh đầu Popup',
      required: true,
      defaultValue: 'THÔNG TIN CHI TIẾT',
    },
    {
      name: 'modalSubtitle',
      type: 'text',
      label: 'Mô tả phụ dưới tiêu đề Popup (tùy chọn)',
    },
    {
      name: 'modalContent',
      type: 'richText',
      label: 'Nội dung chi tiết trong Popup',
      required: true,
      admin: {
        description: 'Soạn thảo nội dung hiển thị trong Popup (chữ, bảng, danh sách, hình ảnh...).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showCloseButton',
          type: 'checkbox',
          label: 'Hiển thị nút "Đóng cửa sổ" ở chân Popup',
          defaultValue: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'closeButtonText',
          type: 'text',
          label: 'Chữ trên nút đóng',
          defaultValue: 'Đóng lại',
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
};