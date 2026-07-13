import React from 'react';

export function CategoryCover({ category }: { category: any }) {
  if (!category) return null;
  const coverUrl = category.coverImage?.url || null;
  
  if (!coverUrl) return null;

  return (
    <div className="w-full h-[200px] md:h-[300px] relative flex-shrink-0 rounded-2xl overflow-hidden shadow-sm mb-6">
      <img src={coverUrl} alt={category.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-200 text-sm md:text-base max-w-2xl line-clamp-2">{category.description}</p>
        )}
      </div>
    </div>
  );
}
