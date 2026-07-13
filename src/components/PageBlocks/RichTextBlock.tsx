import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';
import { LexicalErrorBoundary } from '@/components/LexicalErrorBoundary';

interface Props { content: any; }

export function PageRichTextBlock({ content }: Props) {
  if (!content) return null;

  return (
    <div className="prose prose-base md:prose-lg max-w-none break-words prose-p:!my-1.5 md:prose-p:!my-2 prose-headings:!my-3 md:prose-headings:!my-4 prose-ul:!my-1 prose-li:!my-0.5 prose-img:!my-3 prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
      <LexicalErrorBoundary>
        <RichText data={content} converters={getJsxConverters('Hình ảnh minh họa')} />
      </LexicalErrorBoundary>
    </div>
  );
}
