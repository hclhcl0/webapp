import React from 'react';

export function CategoryCover({ category }: { category: any }) {
  if (!category) return null;
  const coverUrl = category.coverImage?.url || null;
  
  if (!coverUrl) return null;

  return (
    <div className="w-full h-[250px] md:h-[400px] relative flex-shrink-0">
      <img src={coverUrl} alt={category.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-200 text-sm md:text-lg max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
