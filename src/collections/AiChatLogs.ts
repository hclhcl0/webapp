import type { CollectionConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';

export const AiChatLogs: CollectionConfig = {
  slug: 'ai-chat-logs',
  labels: {
    singular: 'Nhật ký Hỏi đáp AI',
    plural: 'Nhật ký Hỏi đáp AI',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'status', 'feedback', 'matchedSources', 'isResolved', 'createdAt'],
    group: 'Quản trị hệ thống',
    description: 'Theo dõi các câu hỏi của người dân với Trợ lý AI, phát hiện các câu hỏi AI chưa trả lời được để bổ sung vào Kho tri thức.',
    components: {
      beforeList: [
        '@/components/Admin/AiChatStatsBanner.tsx#AiChatStatsBanner',
      ],
    },
  },
  access: {
    read: ({ req: { user } }) => canAccessModule(user, 'ai-knowledge', ['admin', 'moderator', 'editor']),
    create: () => true,
    update: ({ req: { user } }) => canAccessModule(user, 'ai-knowledge', ['admin', 'moderator', 'editor']),
    delete: ({ req: { user } }) => canAccessModule(user, 'ai-knowledge', ['admin']),
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      label: 'Câu hỏi của người dân',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      label: 'Câu trả lời của AI',
      admin: {
        readOnly: true,
        rows: 6,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'answered',
          label: 'Trạng thái trả lời',
          options: [
            { label: '✅ Đã trả lời', value: 'answered' },
            { label: '⚠️ Chưa có thông tin (Cần bổ sung)', value: 'unanswered' },
            { label: '🚫 Ngoài phạm vi y tế', value: 'out_of_scope' },
            { label: '❌ Lỗi / Quá tải', value: 'error' },
          ],
          admin: {
            width: '35%',
          },
        },
        {
          name: 'feedback',
          type: 'select',
          defaultValue: 'none',
          label: 'Đánh giá từ người dân',
          options: [
            { label: '— Chưa đánh giá', value: 'none' },
            { label: '👍 Hữu ích', value: 'helpful' },
            { label: '👎 Chưa hài lòng', value: 'not_helpful' },
          ],
          admin: {
            width: '35%',
          },
        },
        {
          name: 'isResolved',
          type: 'checkbox',
          defaultValue: false,
          label: 'Đã bổ sung vào Kho tri thức',
          admin: {
            width: '30%',
            description: 'Tích chọn sau khi đã cập nhật tài liệu cho câu hỏi này.',
          },
        },
      ],
    },
    {
      name: 'adminNote',
      type: 'textarea',
      label: 'Ghi chú xử lý của Cán bộ / Admin',
      admin: {
        rows: 3,
        placeholder: 'Ghi chú tài liệu đã bổ sung hoặc hướng xử lý...',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'matchedSources',
          type: 'text',
          label: 'Nguồn tri thức đã trích xuất',
          admin: {
            readOnly: true,
            width: '40%',
          },
        },
        {
          name: 'modelUsed',
          type: 'text',
          label: 'Mô hình AI',
          admin: {
            readOnly: true,
            width: '20%',
          },
        },
        {
          name: 'responseTimeMs',
          type: 'number',
          label: 'Thời gian phản hồi (ms)',
          admin: {
            readOnly: true,
            width: '20%',
          },
        },
        {
          name: 'clientIp',
          type: 'text',
          label: 'IP người hỏi (ẩn danh)',
          admin: {
            readOnly: true,
            width: '20%',
          },
        },
      ],
    },
  ],
};
