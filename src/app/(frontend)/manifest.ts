import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CDC Đà Nẵng',
    short_name: 'CDC Đà Nẵng',
    description: 'Cổng thông tin điện tử Trung tâm Kiểm soát Bệnh tật TP Đà Nẵng',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#007a8c',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
