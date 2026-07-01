import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),
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

