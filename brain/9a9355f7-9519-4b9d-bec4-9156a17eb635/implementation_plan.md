# Nâng cấp giao diện chung cho tất cả chuyên mục

Hệ thống hiện tại có 2 giao diện chuyên mục:
1. Giao diện chuyên sâu (có Sidebar cây thư mục 3 cấp, ảnh bìa, nổi bật): Đang được code "cứng" dành riêng cho `/suc-khoe` và `/dich-vu`.
2. Giao diện cơ bản (chỉ có lưới bài viết, không có Sidebar): Đang dùng chung cho tất cả các chuyên mục còn lại tại `/chuyen-muc/[slug]`.

Theo yêu cầu của bạn, chúng ta sẽ **nâng cấp toàn bộ hệ thống chuyên mục** để mọi chuyên mục cha (như *Đào tạo*, *Tin tức*, *Chỉ đạo tuyến*...) đều tự động có giao diện xịn sò giống hệt trang Sức khỏe.

## Đề xuất thay đổi

### 1. Tạo component GenericCategorySidebar
- Nhân bản `HealthSidebar` thành một component dùng chung.
- Component này có khả năng tự động nhận diện URL gốc (`/chuyen-muc/[slug-cha]`) để tạo link cho các menu con, thay vì bị cố định là `/suc-khoe`.

### 2. Định tuyến động đa cấp (Catch-all Route)
- Xóa thư mục cũ `src/app/(frontend)/chuyen-muc/[slug]` (chỉ hỗ trợ 1 cấp).
- Thay thế bằng `src/app/(frontend)/chuyen-muc/[...slug]/page.tsx` (hỗ trợ N cấp độ: Cha -> Con -> Cháu).

### 3. Logic hiển thị tự động
Khi người dùng vào `/chuyen-muc/tin-tuc-su-kien`:
- Hệ thống tự động tìm chuyên mục `tin-tuc-su-kien`.
- Quét toàn bộ chuyên mục con của nó để dựng cây Sidebar bên trái.
- Hiển thị bài viết của toàn bộ cây chuyên mục này bên phải.
- Áp dụng tương tự cho bất kỳ chuyên mục gốc nào mà bạn tạo trong Admin Panel!

## Câu hỏi cho bạn (Vui lòng phản hồi trước khi tiến hành)

> [!IMPORTANT]
> 1. Hiện tại trang Sức khỏe truy cập qua `/suc-khoe`. Nếu nâng cấp, tất cả chuyên mục khác sẽ truy cập qua `/chuyen-muc/[tên-chuyên-mục]`. Bạn có đồng ý với cấu trúc URL này không?
> 2. Các trang cũ `/suc-khoe` và `/dich-vu` mình vẫn giữ nguyên để không làm đứt gãy link SEO cũ của bạn nhé?

---
*Vui lòng bấm **Proceed** hoặc trả lời "Đồng ý" để mình bắt đầu viết code!*
