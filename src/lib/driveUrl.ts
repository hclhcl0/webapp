/**
 * Google Drive URL utilities
 *
 * Các dạng link Google Drive phổ biến:
 *   - Share link:   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - Open link:    https://drive.google.com/open?id=FILE_ID
 *   - Export link:  https://docs.google.com/document/d/FILE_ID/export?format=pdf
 *   - Old format:   https://drive.google.com/uc?id=FILE_ID
 */

/**
 * Trích xuất FILE_ID từ mọi dạng link Google Drive.
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;

  // https://drive.google.com/file/d/FILE_ID/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (fileMatch) return fileMatch[1];

  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID&...
  const paramMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (paramMatch) return paramMatch[1];

  // https://docs.google.com/document/d/FILE_ID/...
  const docsMatch = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (docsMatch) return docsMatch[1];

  return null;
}

/**
 * Chuyển link Google Drive chia sẻ thành link tải trực tiếp.
 *
 * VD: https://drive.google.com/file/d/ABC123/view?usp=sharing
 *  → https://drive.google.com/uc?export=download&id=ABC123
 */
export function toDriveDownloadUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = extractDriveFileId(url);
  if (!id) return url; // trả về nguyên nếu không nhận dạng được
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/**
 * Chuyển link Google Drive thành link xem trước (embed preview).
 *
 * VD: https://drive.google.com/file/d/ABC123/preview
 */
export function toDrivePreviewUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

/**
 * Kiểm tra xem URL có phải Google Drive không.
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Lấy URL tải về tốt nhất:
 *   - Ưu tiên file upload (Payload media)
 *   - Nếu không có → dùng driveUrl chuyển đổi
 */
export function resolveFileUrl(
  fileUrl: string | null | undefined,
  driveUrl: string | null | undefined
): string | null {
  if (fileUrl) return fileUrl;
  return toDriveDownloadUrl(driveUrl);
}

/**
 * Tạo tên hiển thị cho link Drive (rút gọn nếu quá dài).
 */
export function driveLinkLabel(url: string): string {
  const id = extractDriveFileId(url);
  return id ? `Google Drive (${id.substring(0, 8)}...)` : 'Google Drive';
}
