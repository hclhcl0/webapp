import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { jsxConverters } from '@/components/LexicalConverters';

interface RichTextSectionProps {
  content: any;
}

export function RichTextSection({ content }: RichTextSectionProps) {
  if (!content) return null;

  return (
    <section className="w-full py-6 my-2">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
          <RichText data={content} converters={jsxConverters} />
        </div>
      </div>
    </section>
  );
}
