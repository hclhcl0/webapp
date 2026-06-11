import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { jsxConverters } from '@/components/LexicalConverters';

interface Props { content: any; }

export function PageRichTextBlock({ content }: Props) {
  if (!content) return null;
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-[var(--primary)] prose-a:text-[var(--secondary)] hover:prose-a:text-[var(--primary)] prose-img:rounded-xl">
      <RichText data={content} converters={jsxConverters} />
    </div>
  );
}
