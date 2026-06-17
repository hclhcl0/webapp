import type { Metadata } from 'next';
import '../(frontend)/globals-compiled.css';
import PortalShell from '@/components/PortalLayout/PortalShell';

import { getPayload } from "payload";
import configPromise from "@payload-config";

export const metadata: Metadata = {
  title: 'Cổng nhân viên — CDC Đà Nẵng',
  robots: 'noindex, nofollow',
};

export const dynamic = 'force-dynamic';

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '0, 122, 140';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 122, 140';
}

function fontValueToName(value: string): string {
  return value.replace(/\+/g, ' ');
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let themeConfig: any = null;
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'settings' });
    themeConfig = (settings as any)?.themeConfig;
  } catch (e) {
    console.error("Error fetching settings in layout:", e);
  }

  const primaryColor = themeConfig?.primaryColor || '#007a8c';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#005a68';
  const secondaryColor = themeConfig?.secondaryColor || '#4999d6';
  const primaryRgb = hexToRgb(primaryColor);

  const fontValue = themeConfig?.fontFamily || 'Inter';
  const fontName = fontValueToName(fontValue);
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontValue}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --gov-primary: ${primaryColor};
              --gov-primary-dark: ${primaryDarkColor};
              --gov-secondary: ${secondaryColor};
              --primary: ${primaryColor};
              --primary-dark: ${primaryDarkColor};
              --secondary: ${secondaryColor};
              --primary-rgb: ${primaryRgb};
              --font-family: '${fontName}', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
      </head>
      <body style={{ margin: 0, background: '#f1f5f9', fontFamily: 'var(--font-family, Inter)' }}>
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
