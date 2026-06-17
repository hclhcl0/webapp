import type { GlobalConfig } from 'payload';

export const SalaryEmailGlobal: GlobalConfig = {
  slug: 'salary-email-ui',
  label: 'Gửi tin nội bộ',
  admin: {
    group: 'Zalo OA',
    components: {
      views: {
        edit: {
          root: {
            Component: '@/components/views/SalaryEmailView',
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
