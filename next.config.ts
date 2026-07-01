import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/globals/settings',
        destination: '/admin/globals/site-settings',
        permanent: false,
      },
    ];
  },
};

export default withPayload(nextConfig);

