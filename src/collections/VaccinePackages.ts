import type { CollectionConfig } from 'payload';
import { canAccessModule } from '../lib/rbac.ts';
import { clearKnowledgeCache } from '../lib/gemini.ts';

export const VaccinePackages: CollectionConfig = {
  slug: 'vaccine-packages',
  labels: {
    singular: 'Gói Vắc Xin',
    plural: 'Gói Vắc Xin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'targetGroup', 'packageType', 'discountPrice', 'isActive'],
    group: 'Dịch vụ Y tế & Tiêm chủng',
    description: 'Quản lý các gói combo vắc xin. Lưu ý: Tiêm từ liều thứ 2 trở đi sẽ được giảm 50.000đ/liều (miễn phí khám & tư vấn). Đường dẫn web: /goi-vac-xin',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator', 'editor']),
    update: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator', 'editor']),
    delete: ({ req: { user } }) => canAccessModule(user, 'vaccines', ['admin', 'moderator']),
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const items: any[] = data?.items || [];
        if (!items.length) return data;

        const errors: string[] = [];
        const seenGroupKeys = new Set<string>();
        let autoOriginalPrice = 0;

        await Promise.all(
          items.map(async (item: any, itemIdx: number) => {
            const vaccineId = typeof item.vaccine === 'object' ? item.vaccine?.id : item.vaccine;
            if (!vaccineId) return;

            try {
              const vaccine = await req.payload.findByID({ collection: 'vaccines' as any, id: vaccineId });
              const v = vaccine as any;
              const maxDoses = v?.scheduleDoses;
              if (item.doses && maxDoses != null && item.doses > maxDoses) {
                errors.push(
                  `Vắc xin "${v?.name || vaccineId}": số liều trong gói (${item.doses}) vượt quá phác đồ chuẩn (${maxDoses} liều)`
                );
              }

              // Tự động lấy giá từ Danh mục vắc xin nếu chưa có
              if (v?.price != null) {
                if (!item.unitPrice) {
                  item.unitPrice = v.price;
                }
                if (!item.originalUnitPrice) {
                  item.originalUnitPrice = v.price;
                }
              }

              // Tính giá gói: mỗi nhóm bệnh chỉ tính 1 vắc xin đầu tiên
              const groupId = typeof item.group === 'object' ? item.group?.id : item.group;
              const groupKey = groupId
                ? `group_${groupId}`
                : (item.diseaseName?.trim() ? `disease_${item.diseaseName.trim().toLowerCase()}` : `item_${item.id || itemIdx}`);

              if (!seenGroupKeys.has(groupKey)) {
                seenGroupKeys.add(groupKey);
                const price = v?.price ?? item.unitPrice ?? 0;
                autoOriginalPrice += (item.doses || 1) * price;
              }
            } catch {
              // Vắc xin không tìm thấy — bỏ qua
            }
          })
        );

        if (errors.length) {
          throw new Error(
            `Không thể lưu gói vắc xin:\n${errors.join('\n')}`
          );
        }

        // Tự động tính giá gói nếu để trống
        if (!data.originalPrice && autoOriginalPrice > 0) {
          data.originalPrice = autoOriginalPrice;
        }
        if (!data.discountPrice && (data.originalPrice || autoOriginalPrice > 0)) {
          const basePrice = data.originalPrice || autoOriginalPrice;
          data.discountPrice = Math.round(basePrice * 0.9);
        }
        if (!data.discountLabel) {
          data.discountLabel = 'Giá tham khảo tại CDC Đà Nẵng';
        }

        return data;
      },
    ],
    afterChange: [() => { clearKnowledgeCache(); }],
    afterDelete: [() => { clearKnowledgeCache(); }],
  },
  fields: [
    // ─── Thông tin cơ bản ───────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      label: 'Tên gói',
      required: true,
      admin: { description: 'VD: Gói Combo 6 Tháng, Gói Tiền Học Đường...' },
    },
    {
      name: 'targetGroup',
      type: 'text',
      label: 'Đối tượng / Độ tuổi',
      required: true,
      admin: { description: 'VD: 0-6 tháng tuổi, Trẻ 3-9 tuổi...' },
    },
    {
      name: 'packageType',
      type: 'select',
      label: 'Phân loại gói',
      required: true,
      defaultValue: 'by_age',
      options: [
        { label: 'Theo độ tuổi', value: 'by_age' },
        { label: 'Theo đối tượng', value: 'by_target' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình ảnh minh họa',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
      admin: { description: 'Hiển thị dưới tên gói trong sidebar' },
    },

    // ─── Giá ───────────────────────────────────────────────────
    {
      name: 'originalPrice',
      type: 'number',
      label: 'Giá gốc (VNĐ)',
      admin: { description: 'Để trống hệ thống sẽ tự động tính từ tổng giá các vắc xin trong gói' },
    },
    {
      name: 'discountPrice',
      type: 'number',
      label: 'Giá ưu đãi (VNĐ)',
      admin: { description: 'Để trống hệ thống sẽ tự động tính giảm 10% từ giá gốc' },
    },
    {
      name: 'discountLabel',
      type: 'text',
      label: 'Nhãn khuyến mãi',
      admin: { description: 'VD: Giá tham khảo tại CDC Đà Nẵng — hiển thị trên thẻ gói' },
    },

    // ─── Danh sách vắc xin trong gói ───────────────────────────
    {
      name: 'items',
      type: 'array',
      label: 'Danh sách vắc xin trong gói',
      minRows: 1,
      admin: {
        description: 'Thêm từng vắc xin vào gói, kèm số liều và phác đồ',
      },
      fields: [
        {
          name: 'vaccine',
          type: 'relationship',
          relationTo: 'vaccines' as any,
          label: 'Vắc xin',
          required: true,
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'vaccine-groups' as any,
          label: 'Nhóm bệnh phòng',
          admin: {
            description: 'Chọn nhóm bệnh phòng từ danh sách — sẽ hiển thị như tiêu đề nhóm trên trang web',
          },
        },
        {
          name: 'diseaseName',
          type: 'text',
          label: 'Nhóm bệnh phòng (text tự do - cũ)',
          admin: {
            description: '⚠️ Trường cũ — hãy dùng "Nhóm bệnh phòng" phía trên thay thế. Chỉ hiển thị khi chưa chọn nhóm.',
            condition: (_data: any, siblingData: any) => !siblingData?.group,
          },
        },
        {
          name: 'doses',
          type: 'number',
          label: 'Số liều',
          required: true,
          defaultValue: 1,
          min: 1,
          admin: {
            description: '⚠️ Không được vượt quá Phác đồ chuẩn đã khai báo trong Danh mục Vắc xin. Hệ thống sẽ báo lỗi nếu vượt quá.',
          },
        },
        {
          name: 'protocol',
          type: 'text',
          label: 'Phác đồ',
          admin: { description: 'VD: 2 Liều, 3 Liều...' },
        },
        {
          name: 'unitPrice',
          type: 'number',
          label: 'Đơn giá / liều (VNĐ)',
          admin: { description: 'Để trống hệ thống sẽ tự động lấy từ Danh mục vắc xin' },
        },
        {
          name: 'originalUnitPrice',
          type: 'number',
          label: 'Đơn giá gốc / liều (VNĐ)',
          admin: { description: 'Để trống hệ thống sẽ tự động lấy từ Danh mục vắc xin' },
        },
      ],
    },

    // ─── Cài đặt ───────────────────────────────────────────────
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hơn hiển thị trước' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Hiển thị',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Gói nổi bật (mặc định được chọn)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
};
