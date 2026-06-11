import React from 'react';
import { NewsGrid } from '@/components/NewsGrid';
import { BannerSection } from './BannerSection';
import { StatsSection } from './StatsSection';
import { QuickLinksSection } from './QuickLinksSection';
import { RichTextSection } from './RichTextSection';
import { VideoSection } from './VideoSection';
import { TikTokSection } from './TikTokSection';

interface HomeSectionRendererProps {
  sections: any[];
}

export async function HomeSectionRenderer({ sections }: HomeSectionRendererProps) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section: any, index: number) => {
        const blockType = section.blockType;

        switch (blockType) {
          case 'newsCategorySection': {
            const catObj = typeof section.category === 'object' ? section.category : null;
            const catId = catObj ? catObj.id : section.category;
            const catName = catObj ? catObj.name : 'Chuyên mục';
            const catSlug = catObj ? catObj.slug : '';
            return (
              <NewsGrid
                key={`${blockType}-${index}`}
                categoryId={catId}
                categoryName={catName}
                categorySlug={catSlug}
                limitOverride={section.limit}
                layoutOverride={section.layout}
              />
            );
          }

          case 'bannerSection':
            return (
              <BannerSection
                key={`${blockType}-${index}`}
                image={section.image}
                title={section.title}
                subtitle={section.subtitle}
                linkUrl={section.linkUrl}
                openInNewTab={section.openInNewTab}
                style={section.style}
              />
            );

          case 'videoSection':
            return (
              <VideoSection
                key={`${blockType}-${index}`}
                title={section.title}
                channel={section.channel}
                limit={section.limit}
                layout={section.layout}
              />
            );

          case 'tiktokSection':
            return (
              <TikTokSection
                key={`${blockType}-${index}`}
                title={section.title}
                channel={section.channel}
                limit={section.limit}
              />
            );

          case 'statsSection':
            return (
              <StatsSection
                key={`${blockType}-${index}`}
                title={section.title}
                backgroundColor={section.backgroundColor}
                stats={section.stats || []}
              />
            );

          case 'quickLinksSection':
            return (
              <QuickLinksSection
                key={`${blockType}-${index}`}
                title={section.title}
                links={section.links || []}
              />
            );

          case 'richTextSection':
            return (
              <RichTextSection
                key={`${blockType}-${index}`}
                content={section.content}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
