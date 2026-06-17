import type { GlobalConfig } from 'payload';

export const ZaloSettingsGlobal: GlobalConfig = {
  slug: 'zalo-settings-ui',
  label: 'Cài đặt Zalo & API',
  admin: {
    group: 'Cấu hình',
    components: {
      views: {
        edit: {
          root: {
            Component: '@/components/views/ZaloSettingsView',
          }
        }
      }
    }
  },
  fields: [
    {
      name: 'dummy',
      type: 'text',
      admin: { hidden: true }
    }
  ],
};
