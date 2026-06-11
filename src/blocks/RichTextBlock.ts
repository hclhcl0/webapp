import type { Block } from 'payload';
import { lexicalEditor, BlocksFeature, HeadingFeature, AlignFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from './VideoBlock.ts';
import { PDFBlock } from './PDFBlock.ts';
import { GalleryBlock } from './GalleryBlock.ts';
import { CalloutBlock } from './CalloutBlock.ts';
import { ButtonBlock } from './ButtonBlock.ts';
import { CardBlock } from './CardBlock.ts';
import { ColumnsBlock } from './ColumnsBlock.ts';

export const RichTextBlock: Block = {
  slug: 'richTextBlock',
  interfaceName: 'RichTextBlock',
  labels: {
    singular: '📝 Nội dung văn bản (RichText)',
    plural: 'Nội dung văn bản',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Nội dung',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          AlignFeature(),
          BlocksFeature({
            blocks: [
              ColumnsBlock,
              VideoBlock,
              PDFBlock,
              GalleryBlock,
              CalloutBlock,
              ButtonBlock,
              CardBlock,
            ],
          }),
        ],
      }),
    },
  ],
};
