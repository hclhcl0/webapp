import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';
import { SitePopupClient } from './SitePopupClient';

export interface SitePopupProps {
  popupConfig?: {
    enabled?: boolean | null;
    type?: string | null;
    article?: any;
    title?: string | null;
    image?: any;
    content?: any;
    linkUrl?: string | null;
    delaySeconds?: number | null;
    showOnce?: boolean | null;
  };
}

export function SitePopup({ popupConfig }: SitePopupProps) {
  if (!popupConfig?.enabled) return null;

  const isArticle = popupConfig.type === 'article' && popupConfig.article;
  const displayTitle = isArticle ? popupConfig.article.title : popupConfig.title;
  const displayImage = isArticle ? popupConfig.article.image : popupConfig.image;
  const displayLinkUrl = isArticle ? `/bai-viet/${popupConfig.article.slug}` : popupConfig.linkUrl;
  const articleDescription = isArticle ? popupConfig.article.description : null;

  const renderedContent = !isArticle && popupConfig.content ? (
    <RichText 
      data={popupConfig.content} 
      converters={getJsxConverters('Hình minh họa Popup')} 
    />
  ) : null;

  return (
    <SitePopupClient 
      displayTitle={displayTitle}
      displayImage={displayImage}
      displayLinkUrl={displayLinkUrl}
      isArticle={isArticle}
      articleDescription={articleDescription}
      renderedContent={renderedContent}
      delaySeconds={popupConfig.delaySeconds}
      showOnce={popupConfig.showOnce}
    />
  );
}
