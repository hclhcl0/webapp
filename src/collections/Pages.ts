import type { CollectionConfig } from 'payload';
import { HeroBannerBlock } from '../blocks/HeroBanner.ts';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { RichTextBlock } from '../blocks/RichTextBlock.ts';
import { SectionTitleBlock } from '../blocks/SectionTitleBlock.ts';
import { CardGridBlock } from '../blocks/CardGridBlock.ts';
import { StepsBlock } from '../blocks/StepsBlock.ts';
import { FaqBlock } from '../blocks/FaqBlock.ts';
import { DividerBlock } from '../blocks/DividerBlock.ts';
import { CtaBannerBlock } from '../blocks/CtaBannerBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { TableBlock } from '../blocks/TableBlock.ts';
import { QuoteBlock } from '../blocks/QuoteBlock.ts';
import { AudioBlock } from '../blocks/AudioBlock.ts';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock.ts';
import { SliderBlock } from '../blocks/SliderBlock.ts';
import { InfographicBlock } from '../blocks/InfographicBlock.ts';
import { ZaloWidgetBlock } from '../blocks/ZaloWidgetBlock.ts';
import { LivestreamBlock } from '../blocks/LivestreamBlock.ts';
import { ScheduleBlock } from '../blocks/ScheduleBlock.ts';
import { MagazineBlock } from '../blocks/MagazineBlock.ts';
import { PopupBlock } from '../blocks/PopupBlock.ts';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Trang nội dung',
    plural: 'Các trang niội dung',
  },
  admin: {
    description: '👒 Đường dẫn xem trên website: /[slug]',
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'slug', 'pageType', 'updatedAt'],
    preview: (doc) => {
      if (doc?.slug) {
        return `${doc.slug}?preview=true`;
      }
      return null;
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
    update: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ── Thông tin cơ bản ─�@
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề trang',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Đường dẫn tĩnh (Slug)',
      required: true,
      unique: true,
      admin: {
        components: {
          Field: '@/components/SlugField.tsx#SlugField',
        },
        description: 'Đường dẫn URL (VD: gioi-thieu ↏ /gioi-thieu)',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      label: 'Loại trang',
      defaultValue: 'standard',
      options: [
        { label: '�4 Trang thông tin chuẩn', value: 'standard' },
        { label: '🤥 Trang Giới thiệu / Về chúng tôi', value: 'about' },
        { label: '🕐 Trang Liên hệ (có form)', value: 'contact' },
        { label: '❩ Trang FAQ | phản hểi', value: 'faq' },
        { label: '🚐 Trang Landing Page', value: 'landing' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Chọn loại trang để ap dụng template phù hợp.',
      },
    },
    // ── Layout & Hiển thị ♠♠
    {
      name: 'layout',
      type: 'select',
      label: 'Bố cục trang',
      defaultValue: 'withSidebar',
      options: [
        { label: '�, Có Sidebar (như trang bài viết)', value: 'withSidebar' },
        { label: '📍 Nội dung hẹp căn giỳa (dạng tài liệu', value: 'narrow' },
        { label: '💻 Toàn chiều rộng (không sidebar)', value: 'fullWidth' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // ─�@ 'SEO' ♠♠
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Chia sẁ mạng xã hội',
      admin: {
        description: 'Tùy chỉnh thông tin hiển thị khi chia sẫ lên Google, Facebook, Zalo...',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đị SEO (dęể trống = dùng tiêu đề trang)',
          admin: { description: 'Tối đa 60 ký tự. VD: Giới thiệu CDC Đà Nẵng | Trung tâm Kiểm soát Bệnh tật' },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: { rows: 3, description: 'Tối đa 160 ký tự. Mô tả ngắn hiển thị trên kết quả tìm kiếm Google.' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'ảnh chia sẫ (Open Graph Image)',
          admin: { description: 'Kích thước khuyến nghị: 1200×630px. Hiển thị khi chia sẫ lên Facebook, Zalo.' },
        },
      ],
    },
    // ♠♠ Nội dung trang (Blocks) ♠♠
    {
      name: 'content',
      type: 'blocks',
      label: 'Nội dung trang (Page Builder)',
      labels: {
        singular: 'Thành phần',
        plural: 'Danh sḑch thành phần',
      },
      admin: {
        description: 'Kéo thả để sắp xếp thứ tự hiển thị các thành phần của trang.',
      },
      blocks: [
        RichTextBlock,
        SectionTitleBlock,
        CalloutBlock,
        ColumnsBlock,
        DividerBlock,
        CardGridBlock,
        CardBlock,
        StepsBlock,
        PopupBlock,
        FaqBlock,
        ButtonBlock,
        CtaBannerBlock,
        VideoBlock,
        TikTokBlock,
        GalleryBlock,
        PDFBlock,
        EmbedBlock,
        TableBlock,
        RelatedArticlesBlock,
        CategoryNewsBlock,
        QuoteBlock,
        AudioBlock,
        FileDownloadsBlock,
        SliderBlock,
        InfographicBlock,
        ZaloWidgetBlock,
        LivestreamBlock,
        ScheduleBlock,
        MagazineBlock,
        HeroBannerBlock,
      ],
    },
  ],
};
