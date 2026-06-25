import type { CollectionConfig } from 'payload';

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  labels: {
    singular: 'API Key',
    plural: 'Danh sách API Keys',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'provider', 'isActive', 'usageCount'],
    group: 'AI & Trợ lý ảo',
  },
  fields: [
    { name: 'label', type: 'text', required: true, label: 'Tên gợi nhớ' },
    { name: 'provider', type: 'select', required: true, options: [{ label: 'Google Gemini', value: 'gemini' }, { label: 'Groq', value: 'groq' }], label: 'Nhà cung cấp' },
    { name: 'apiKey', type: 'text', required: true, label: 'API Key' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Đang hoạt động' },
    { 
      name: 'checkApiUI', 
      type: 'ui', 
      admin: { 
        components: { 
          Field: '@/collections/components/CheckApiButton#CheckApiButton' 
        } 
      } 
    },
    { 
      name: 'supportedModels', 
      type: 'text', 
      label: 'Các Mô Hình Hỗ Trợ', 
      admin: { 
        readOnly: true,
        description: 'Tự động điền sau khi Kiểm tra kết nối thành công.'
      } 
    },
    {
      name: 'preferredModel',
      type: 'text',
      label: 'Mô hình ưu tiên (Gán riêng)',
      admin: { 
        readOnly: true,
        description: 'Được tự động gán khi bạn chọn từ nút Kiểm tra bên dưới.'
      }
    },
    { name: 'usageTokens', type: 'number', defaultValue: 0, label: 'Tổng Token đã dùng', admin: { readOnly: true } },
    { name: 'usageCount', type: 'number', defaultValue: 0, label: 'Số lượt gọi', admin: { readOnly: true } },
  ],
};
