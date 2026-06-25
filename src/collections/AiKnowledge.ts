import type { CollectionConfig } from 'payload';
import { extractAiKnowledgeHook } from './hooks/extractAiKnowledge.ts';

export const AiKnowledge: CollectionConfig = {
  slug: 'ai-knowledge',
  labels: {
    singular: 'Tài liệu AI (Knowledge)',
    plural: 'Kho tri thức AI',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
    group: 'AI & Trợ lý ảo',
  },
  upload: {
    staticDir: '../../media/ai-docs',
    mimeTypes: [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'text/plain', 
      'image/png', 
      'image/jpeg'
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tên tài liệu' },
    { name: 'category', type: 'text', required: true, label: 'Nhãn chuyên môn' },
    { 
      name: 'extractionModel', 
      type: 'select', 
      label: 'Mô hình AI để đọc file', 
      defaultValue: 'gemini-2.5-flash',
      options: [
        { label: 'Gemini 2.5 Flash (Nhanh, Tốt nhất)', value: 'gemini-2.5-flash' },
        { label: 'Gemini 2.5 Pro (Thông minh, Chậm hơn)', value: 'gemini-2.5-pro' },
        { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
      ],
      admin: {
        description: 'Chọn mô hình AI sẽ phân tích và trích xuất file này. Yêu cầu phải có API Key cấu hình trong mục Cài đặt -> API Keys.',
      }
    },
    { 
      name: 'content', 
      type: 'textarea', 
      label: 'Nội dung văn bản (AI trích xuất tự động)',
      admin: {
        description: 'Hệ thống sẽ tự động điền nội dung vào đây sau khi AI đọc xong file tải lên.',
      }
    },
    { 
      name: 'uploadedBy', 
      type: 'relationship', 
      relationTo: 'users',
      label: 'Người tải lên',
      admin: { readOnly: true }
    },
    { name: 'embedding', type: 'text', label: 'Vector Embedding (JSON)', admin: { readOnly: true } },
    {
      name: 'allowedDepartment',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: true,
      label: 'Phòng ban được phép xem',
      admin: {
        description: 'Để trống = tất cả phòng ban đều có thể xem.',
      },
    },
  ],
  hooks: {
    beforeChange: [extractAiKnowledgeHook],
  },
};
