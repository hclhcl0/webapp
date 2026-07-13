'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTopHelper() {
  const pathname = usePathname();

  useEffect(() => {
    // Ép trình duyệt tự động scroll lên đỉnh mỗi khi URL thay đổi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Không dùng smooth để trang hiển thị lên đỉnh ngay lập tức
    });
  }, [pathname]);

  return null;
}
