import React from 'react';

interface Props {
  title?: string;
  embedType?: 'custom' | 'googlemaps' | 'facebook';
  htmlCode?: string;
  googleMapsUrl?: string;
  facebookUrl?: string;
  height?: number;
}

export function EmbedBlock({ title, embedType = 'custom', htmlCode, googleMapsUrl, facebookUrl, height = 400 }: Props) {
  return (
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>}

      {embedType === 'googlemaps' && googleMapsUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            src={googleMapsUrl}
            width="100%"
            height={height}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title || 'Google Maps'}
          />
        </div>
      )}

      {embedType === 'facebook' && facebookUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
          <iframe
            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookUrl)}&tabs=timeline&width=500&height=${height}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
            width="100%"
            height={height}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title={title || 'Facebook Page'}
          />
        </div>
      )}

      {embedType === 'custom' && htmlCode && (
        <div
          className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
          dangerouslySetInnerHTML={{ __html: htmlCode }}
          style={{ minHeight: height }}
        />
      )}
    </div>
  );
}
