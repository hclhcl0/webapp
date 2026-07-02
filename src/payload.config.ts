import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { s3Storage } from '@payloadcms/storage-s3';
import { vi } from '@payloadcms/translations/languages/vi';
import { withRBAC, globalsWithRBAC } from './lib/rbac.ts';

// DATABASE_URI = custom Postgres URL
// POSTGRES_URL = auto-injected by Vercel Postgres addon
const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;

import { Users } from './collections/Users.ts';
import { Departments } from './collections/Departments.ts';
import { Media } from './collections/Media.ts';
import { Categories } from './collections/Categories.ts';
import { Tags } from './collections/Tags.ts';
import { Articles } from './collections/Articles.ts';
import { Pages } from './collections/Pages.ts';
import { Banners } from './collections/Banners.ts';
import { Documents } from './collections/Documents.ts';
import { DocumentSigners } from './collections/DocumentSigners.ts';
import { SiteSettings } from './globals/SiteSettings.ts';
import { ServicesLanding } from './globals/ServicesLanding.ts';
import { Settings } from './globals/Settings.ts';
import { WorkSchedules } from './collections/WorkSchedules.ts';
import { Videos } from './collections/Videos.ts';
import { VideoChannels } from './collections/VideoChannels.ts';
import { FormSubmissions } from './collections/FormSubmissions.ts';
import { OrgUnits } from './collections/OrgUnits.ts';
import { AiKnowledge } from './collections/AiKnowledge.ts';
import { ApiKeys } from './collections/ApiKeys.ts';
import { Procurements } from './collections/Procurements.ts';

import { Services } from './collections/Services.ts';
import { ServiceCategories } from './collections/ServiceCategories.ts';


import { seedAccounts } from './lib/seedAccounts.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  sharp,
  cors: [
    'https://h5.zadn.vn',
    'https://h5.zdn.vn',
    'https://zalo.me',
    'https://zcdc.vnos.org',
    'https://cms.zcdc.vnos.org',
    'https://ecdc.vnos.org',
    'https://cms.ecdc.vnos.org',
    '*',
  ],
  csrf: [
    'https://h5.zadn.vn',
    'https://h5.zdn.vn',
    'https://zalo.me',
    'https://zcdc.vnos.org',
    'https://cms.zcdc.vnos.org',
    'https://ecdc.vnos.org',
    'https://cms.ecdc.vnos.org',
  ],
  onInit: async (payload) => {
    // const { initCron } = await import('./lib/zalo-admin/cron.js');
    // initCron();
    await seedAccounts(payload);

    
    // Khởi chạy Cronjob đồng bộ Video
    if (process.env.NODE_ENV !== 'development') { // Tránh chạy nhiều lần khi dev hot-reload
      const { initVideoSyncCron } = await import('./cron/videoSync.ts');
      initVideoSyncCron();
    }
  },
  admin: {
    user: 'users',
    css: path.resolve(dirname, 'admin.css'),
    components: {
      graphics: {
        Logo: '@/app/(payload)/admin/components/AdminLogo.tsx#AdminLogo',
        Icon: '@/app/(payload)/admin/components/AdminIcon.tsx#AdminIcon',
      },
      views: {
        UserGuide: {
          Component: '@/components/Admin/UserGuideView.tsx',
          path: '/huong-dan',
        }
      },
      afterNavLinks: [
        '@/components/Admin/GuideNavLink.tsx'
      ],
      beforeDashboard: [
        '@/app/(payload)/admin/components/AuthorWelcome.tsx#AuthorWelcome',
      ]
    }
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  collections: withRBAC([
    Departments,
    Users,
    Media,
    Categories,
    Tags,
    Articles,
    Pages,
    Banners,
    Documents,
    DocumentSigners,
    WorkSchedules,
    VideoChannels,
    Videos,
    FormSubmissions,
    OrgUnits,
    AiKnowledge,
    ApiKeys,
    Procurements,

    ServiceCategories,
    Services,
  ]),
  globals: globalsWithRBAC([
    SiteSettings,
    ServicesLanding,
  ]),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
    ...(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
              region: process.env.S3_REGION || 'auto',
              endpoint: process.env.S3_ENDPOINT,
              // Required for Cloudflare R2 and MinIO:
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            },
          }),
        ]
      : []),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'YOUR-SUPER-SECRET-KEY',
  db: dbUrl
    ? postgresAdapter({
        pool: {
          connectionString: dbUrl,
        },
        // push: false — Schema được quản lý bởi migrate.mjs (chạy trước next build).
        // Drizzle push ở production sẽ hỏi interactive → treo Docker container.
        // Để force sync 1 lần (khi có schema mới lớn): đặt PAYLOAD_FORCE_PUSH=true tạm thời.
        push: (() => {
          // Sử dụng bracket notation để tránh Next.js Webpack hardcode giá trị lúc build
          const val = String(process.env['PAYLOAD_FORCE_PUSH']).toLowerCase().trim();
          return val === 'true' || val === '1' || val === 'yes';
        })(),
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || 'file:./payload-data.db',
        },
      }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
