import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';

interface RichTextSectionProps {
  content: any;
  containerId?: string;
  className?: string;
}

export const RichTextSection: React.FC<RichTextSectionProps> = ({ content, containerId, className = '' }) => {
  if (!content) return null;

  return (
    <section id={containerId} className={`py-12 md:py-20 w-full px-2 md:px-4 ${className}`}>
      <div className="w-full">
        <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
          <RichText data={content} converters={getJsxConverters('Hình ảnh minh họa')} />
        </div>
      </div>
    </section>
  );
}
