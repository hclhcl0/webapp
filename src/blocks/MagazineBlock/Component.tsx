import React from 'react';
import { MagazineClient } from './MagazineClient';

export type MagazineBlockProps = {
  title: string;
  subtitle?: string;
  description?: string;
  coverImage: any;
  pdfFile?: any;
  magazinePages?: Array<{
    id?: string;
    pageImage?: any;
  }>;
};

export const MagazineBlock: React.FC<MagazineBlockProps> = (props) => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <MagazineClient {...props} />
      </div>
    </section>
  );
};
