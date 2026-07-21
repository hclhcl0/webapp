# Hướng Dẫn Tích Hợp Trình Phát Video TikTok (TikTok Player V1)

Tài liệu này ghi chú lại cách nhúng video TikTok vào website Next.js một cách mượt mà, đầy đủ chức năng (như trang Tiêm chủng Long Châu) và đặc biệt là **tránh hoàn toàn lỗi 403 Forbidden** do hệ thống bảo mật của TikTok gây ra.

## 1. Vấn Đề Gặp Phải Khởi Điểm
Ban đầu, khi làm theo tài liệu chính thức của TikTok bằng cách sử dụng thẻ `<blockquote class="tiktok-embed">` và gọi script `https://www.tiktok.com/embed.js`, trình duyệt thường xuyên gặp lỗi:
- **Lỗi 403 (Forbidden)**: CDN của TikTok (vx-bdp.tiktokv.com) từ chối trả về luồng video (file MP4) nếu phát hiện IP lạ hoặc Referer bị chặn.
- **Không hiện nút Play**: Do video bị lỗi 403, iframe sinh ra tự động sẽ bị khuyết thiếu nút Play khiến người dùng không thể tương tác.

## 2. Giải Pháp: Sử dụng API `player/v1`
Thay vì phụ thuộc vào thư viện `embed.js` thiếu ổn định, chúng ta sử dụng trực tiếp endpoint giao diện người dùng mới nhất của TikTok:
**`https://www.tiktok.com/player/v1/{TIKTOK_VIDEO_ID}`**

Endpoint này trả về một trình phát HTML5 hoàn chỉnh với thanh tiến trình (seekbar), nút điều chỉnh âm lượng, và thông tin video (giống hệt ứng dụng gốc).

### Cấu trúc URL Iframe:
```text
https://www.tiktok.com/player/v1/{TIKTOK_VIDEO_ID}?music_info=1&description=1
```
- `music_info=1`: Hiển thị dải âm thanh đang phát ở góc dưới màn hình.
- `description=1`: Hiển thị mô tả của video.

## 3. Mã Nguồn Mẫu (React/Next.js)

Dưới đây là một Component mẫu chuẩn để nhúng TikTok an toàn:

```tsx
import React from 'react';

const TikTokVideoEmbed = ({ videoUrl }: { videoUrl: string }) => {
  // Biểu thức chính quy bóc tách Video ID từ link TikTok
  const match = videoUrl.match(/tiktok\.com\/.*video\/(\d+)/);
  const tId = match ? match[1] : null;

  if (!tId) return null;

  return (
    // LƯU Ý QUAN TRỌNG: Thẻ bọc (wrapper) bên ngoài BẮT BUỘC phải có tỷ lệ khung hình (aspect-ratio).
    // Nếu đặt position absolute cho iframe bên trong mà thẻ bọc ngoài không có kích thước, video sẽ bị ép thành màn hình đen.
    <div style={{ aspectRatio: '9/16', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <iframe
        className="w-full h-full"
        src={`https://www.tiktok.com/player/v1/${tId}?music_info=1&description=1`}
        title="TikTok video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ aspectRatio: '9/16', minHeight: '500px' }}
      />
    </div>
  );
};

export default TikTokVideoEmbed;
```

## 4. Các Lưu Ý Về CSS (Giao Diện)
- **Tuyệt đối không lạm dụng `position: absolute`**: Nếu Iframe sử dụng `absolute inset-0`, vùng chứa (container) cha buộc phải có chiều cao cụ thể (ví dụ: `height: 600px` hoặc dùng `aspect-ratio: 9/16`). Nếu container thiết lập `aspect-ratio: auto`, nó sẽ bị xẹp về 0px và gây ra hiện tượng **màn hình đen**.
- **Tỷ lệ 9:16**: Khác với YouTube (16:9), TikTok là định dạng video dọc. Hãy luôn đảm bảo khung hình hiển thị tôn trọng tỷ lệ 9:16.
- **Log báo lỗi `unload` trên Console**: Khi xem Console, bạn có thể thấy các dòng chữ đỏ báo `[Violation] Permissions policy violation: unload is not allowed...`. Đây là cảnh báo nội bộ từ các script đo lường bên trong máy chủ của TikTok (ttwstatic.com). Trình duyệt đời mới đưa ra cảnh báo này nhưng nó **không ảnh hưởng** đến quá trình chạy video. Khách hàng vẫn có thể ấn Play mượt mà.
