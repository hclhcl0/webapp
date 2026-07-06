import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true, // Ép Next.js luôn nén nội dung (Gzip/Brotli)
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

export default withSerwist(withPayload(nextConfig));

