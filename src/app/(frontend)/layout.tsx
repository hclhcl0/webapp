import type { Metadata } from "next";
import "./globals-compiled.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import ChatWidget from "@/components/ChatWidget/ChatWidget";
import { SitePopup } from "@/components/SitePopup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Script from "next/script";

import { getPayload } from "payload";
import configPromise from "@payload-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG",
  description: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CDC Đà Nẵng",
    startupImage: '/icon-512x512.png',
  },
  formatDetection: {
    telephone: false,
  },
};

import { Viewport } from 'next';
export const viewport: Viewport = {
  themeColor: '#007a8c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '58, 127, 199';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '58, 127, 199';
}

// Map font value → tên font thực tế (có dấu cách)
function fontValueToName(value: string): string {
  return value.replace(/\+/g, ' ');
}

import { draftMode } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeConfig: any = null;
  let popupConfig: any = null;
  let isDraftMode = false;
  try {
    const { isEnabled } = await draftMode();
    isDraftMode = isEnabled;
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 2 });
    themeConfig = (settings as any)?.themeConfig;
    popupConfig = (settings as any)?.popup;
  } catch (e) {
    console.error("Error fetching settings in layout:", e);
  }

  const primaryColor = themeConfig?.primaryColor || '#3a7fc7';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#0055a7';
  const secondaryColor = themeConfig?.secondaryColor || '#4999d6';
  const primaryRgb = hexToRgb(primaryColor);

  // Font
  const fontValue = themeConfig?.fontFamily || 'Inter';
  const fontName = fontValueToName(fontValue);
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontValue}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;

  return (
    <html lang="vi">
      <head>
        {/* Google Fonts - tải font được chọn từ admin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />

        {/* CSS variables: màu sắc + font chữ */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --primary-dark: ${primaryDarkColor};
              --secondary: ${secondaryColor};
              --primary-rgb: ${primaryRgb};
              --font-family: '${fontName}', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
        <Script id="pwa-init" dangerouslySetInnerHTML={{
          __html: `
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.deferredPrompt = e;
            });
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered:', registration.scope); },
                  function(err) { console.log('SW registration failed:', err); }
                );
              });
            }
          `
        }} />
      </head>
      <body className="bg-gray-100/80 antialiased selection:bg-teal-600 selection:text-white">
        <div className="max-w-[1400px] mx-auto bg-white min-h-screen shadow-2xl flex flex-col overflow-hidden relative border-x border-gray-200">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        
        <BackToTop />
        <ChatWidget />
        {!isDraftMode && <SitePopup popupConfig={popupConfig} />}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
