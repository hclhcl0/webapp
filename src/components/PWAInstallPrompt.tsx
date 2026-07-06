'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';

type Platform = 'ios' | 'android' | 'desktop' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInStandaloneMode()) return;

    // Don't show if user dismissed recently (7 days)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysAgo = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) return;
    }

    const p = detectPlatform();
    setPlatform(p);

    if (p === 'ios') {
      // iOS Safari: show after 3 seconds
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Desktop Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  if (!show) return null;

  // ─── iOS instructions banner ───────────────────────────────────────────────
  if (platform === 'ios') {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] p-3 animate-slide-up"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <div
          className="max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid var(--primary-100)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--primary)' }}>
            <img src="/icon-192x192.png" alt="CDC" className="w-10 h-10 rounded-xl shadow" />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Cài đặt ứng dụng CDC Đà Nẵng</p>
              <p className="text-white/70 text-xs">Truy cập nhanh từ màn hình chính</p>
            </div>
            <button onClick={handleDismiss} className="text-white/70 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          {/* Steps */}
          <div className="px-4 py-4">
            <p className="text-xs text-gray-500 mb-3 font-medium">Thực hiện theo 3 bước sau:</p>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  icon: <Share size={18} style={{ color: 'var(--primary)' }} />,
                  text: (
                    <>
                      Bấm nút <strong>Chia sẻ</strong>{' '}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600">
                        <Share size={12} />
                      </span>{' '}
                      ở thanh dưới Safari
                    </>
                  ),
                },
                {
                  step: '2',
                  icon: <Plus size={18} style={{ color: 'var(--primary)' }} />,
                  text: (
                    <>
                      Cuộn xuống chọn{' '}
                      <strong>"Thêm vào Màn hình chính"</strong>
                    </>
                  ),
                },
                {
                  step: '3',
                  icon: <Download size={18} style={{ color: 'var(--primary)' }} />,
                  text: (
                    <>
                      Bấm <strong>"Thêm"</strong> ở góc trên phải là xong!
                    </>
                  ),
                },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--primary)' }}
                  >
                    {s.step}
                  </span>
                  <p className="text-sm text-gray-600 leading-snug">{s.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              Để sau
            </button>
          </div>
        </div>

        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.35s ease-out; }
        `}</style>
      </div>
    );
  }

  // ─── Android / Desktop Chrome install banner ───────────────────────────────
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-3 animate-slide-up"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid var(--primary-100)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <img src="/icon-192x192.png" alt="CDC" className="w-12 h-12 rounded-xl shadow-sm flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">CDC Đà Nẵng</p>
            <p className="text-xs text-gray-400 truncate">Cài đặt ứng dụng lên thiết bị của bạn</p>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Để sau
          </button>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
            style={{ background: 'var(--primary)' }}
          >
            <Download size={15} />
            {installing ? 'Đang cài...' : 'Cài đặt'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.35s ease-out; }
      `}</style>
    </div>
  );
}
