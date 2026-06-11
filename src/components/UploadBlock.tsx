import { getPayload } from 'payload';
import configPromise from '@payload-config';
import React from 'react';

export async function UploadBlock({ node }: { node: any }) {
  console.log("UploadBlock received node:", node);
  if (!node?.value) return null;

  // If already populated
  if (typeof node.value === 'object' && node.value.url) {
    return (
      <figure className="my-8 text-center w-full" style={{ width: '100%', display: 'block', margin: '2rem 0' }}>
        <img 
          src={node.value.url} 
          alt="image" 
          className="rounded-xl shadow-sm border border-gray-100" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </figure>
    );
  }

  // If it's an ID, fetch it!
  const mediaId = typeof node.value === 'string' || typeof node.value === 'number' 
    ? node.value 
    : (node.value?.id || null);
  if (!mediaId) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
    });

    if (media?.url) {
      return (
        <figure className="my-8 text-center w-full" style={{ width: '100%', display: 'block', margin: '2rem 0' }}>
          <img 
            src={media.url} 
            alt="image" 
            className="rounded-xl shadow-sm border border-gray-100" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </figure>
      );
    }
  } catch (error) {
    console.error("Error fetching media for upload block:", error);
  }

  return null;
}
