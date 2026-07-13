import type { Block } from 'payload';

export const NewsListBlockStub: Block = {
  slug: 'newsList',
  labels: { singular: 'News List (Cũ)', plural: 'News Lists' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'limit', type: 'number' },
  ],
};

export const ExternalLinksBlockStub: Block = {
  slug: 'externalLinks',
  labels: { singular: 'External Links (Cũ)', plural: 'External Links' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
};
