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
    <section id={containerId} className={`py-12 md:py-20 ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="p-4 sm:p-5 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
          <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
            <RichText data={content} converters={getJsxConverters('Hình ảnh minh họa')} />
          </div>
        </div>
      </div>
    </section>
  );
}
