'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export const HeaderSaveButton: React.FC = () => {
  const pathname = usePathname();
  const [isEditView, setIsEditView] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Kiểm tra xem trang hiện tại có phải là trang chỉnh sửa (Document/Global/Account) không
  useEffect(() => {
    if (!pathname) {
      setIsEditView(false);
      return;
    }

    const checkEditView = () => {
      // 1. Kiểm tra theo cấu trúc đường dẫn URL của Payload CMS
      const isGlobal = pathname.includes('/globals/');
      const isCreate = pathname.includes('/create');
      const isAccount = pathname.endsWith('/account') || pathname.includes('/account/');
      // Kiểm tra /collections/:slug/:id (có ít nhất 4 segment: "", "admin", "collections", slug, id)
      const segments = pathname.split('/').filter(Boolean);
      const isDocEdit = segments.length >= 4 && segments[1] === 'collections';

      if (isGlobal || isCreate || isAccount || isDocEdit) {
        setIsEditView(true);
        return;
      }

      // 2. Fallback: Kiểm tra xem trong DOM có nút Save hoặc Form không
      const hasSaveElement = Boolean(
        document.querySelector(
          '#action-save, #action-publish, .doc-controls, form.collection-edit__form, form.global-edit__form'
        )
      );
      setIsEditView(hasSaveElement);
    };

    checkEditView();
    // Chờ 300ms để DOM render xong các element của view
    const timer = setTimeout(checkEditView, 350);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSaving(true);

    // 1. Tìm nút Lưu chuẩn của Payload CMS trong DOM
    const primarySaveBtn = document.querySelector<HTMLButtonElement>(
      '#action-save, #action-publish, .doc-controls button[type="submit"], form.collection-edit__form button[type="submit"], form.global-edit__form button[type="submit"]'
    );

    if (primarySaveBtn && !primarySaveBtn.disabled) {
      primarySaveBtn.click();
    } else {
      // 2. Fallback: Kích hoạt phím tắt Ctrl+S
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));

      // 3. Fallback: submit form trực tiếp
      const form = document.querySelector<HTMLFormElement>(
        'form.collection-edit__form, form.global-edit__form, form#form'
      );
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      }
    }

    setTimeout(() => {
      setIsSaving(false);
    }, 1200);
  }, []);

  // Không hiển thị nếu không phải trang sửa/tạo dữ liệu
  if (!isEditView) {
    return null;
  }

  return (
    <button
      type="button"
      id="header-top-save-btn"
      onClick={handleSave}
      disabled={isSaving}
      title="Lưu thay đổi (Ctrl + S)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '8px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1,
        cursor: isSaving ? 'wait' : 'pointer',
        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
        transition: 'all 0.18s ease-in-out',
        marginRight: '8px',
        height: '34px',
        whiteSpace: 'nowrap',
        opacity: isSaving ? 0.75 : 1,
        transform: isSaving ? 'scale(0.98)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSaving) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(2, 132, 199, 0.45)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaving) {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.35)';
        }
      }}
    >
      {isSaving ? (
        <>
          <svg
            style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <span>Đang lưu...</span>
        </>
      ) : (
        <>
          <svg
            style={{ width: '14px', height: '14px' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Lưu lại</span>
        </>
      )}
    </button>
  );
};
