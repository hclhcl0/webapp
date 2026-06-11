# Quy trình sửa lỗi Vercel Runtime — Payload CMS + Next.js

> **Áp dụng cho**: Dự án `ksbtdn` — Next.js 15 + Payload CMS 3 + PostgreSQL (Prisma DB)
> **Tình huống**: Sau khi thêm block/collection mới vào CMS, website Vercel báo lỗi 500

---

## 🚀 Cập nhật quan trọng: Đã tự động hóa CI/CD với GitHub Actions

Quy trình đồng bộ cơ sở dữ liệu đã được tự động hóa hoàn toàn. Bạn **không cần tạo script thủ công hay chạy SQL bằng tay** nữa. Khi bạn đẩy code lên nhánh `master` trên GitHub, hệ thống CI/CD sẽ tự động:
1. Chạy cập nhật database bằng script kiểm tra lỗi độc lập.
2. Thực hiện deploy bản build mới nhất lên Vercel.

Chi tiết cài đặt các Secrets trên GitHub được nêu ở **Mục 5**.

---

## 1. Kiểm tra log Vercel khi xảy ra sự cố

### 1.1 Cài Vercel CLI (nếu chưa có)
```bash
npm i -g vercel
vercel login
```

### 1.2 Xem log lỗi trực tiếp từ dòng lệnh
```bash
# Vào thư mục project
cd next-frontend

# Xem log lỗi 500 gần nhất dưới dạng đầy đủ
npx vercel logs --level error --expand --limit 20 --json 2>&1

# Xem log chạy thời gian thực (stream)
npx vercel logs --follow
```

> Log lỗi thường chứa thông tin như:
> `error: relation "settings_blocks_news_category_section" does not exist` (Thiếu bảng trong DB)
> Hoặc `error: column settings.home_news_layout does not exist` (Thiếu cột trong bảng)

---

## 2. Các lỗi cơ sở dữ liệu thường gặp

### Lỗi 1: `relation "..." does not exist` (Mã lỗi 42P01)
* **Nguyên nhân**: CMS định nghĩa block hoặc collection mới nhưng database production chưa được tạo bảng.
* **Tại sao xảy ra trên Vercel?** Payload CMS dùng tùy chọn `push: true` để tự động cập nhật bảng. Tuy nhiên trên môi trường Serverless của Vercel, thời gian chờ (timeout) của hàm bị giới hạn (10-60 giây) khiến quá trình phân tích và khởi tạo Drizzle bị kill trước khi kịp tạo bảng.

### Lỗi 2: `column "..." does not exist` (Mã lỗi 42703)
* **Nguyên nhân**: Trường (field) mới được thêm vào collection/global sẵn có, nhưng cột chưa xuất hiện ở database.
* **Giải pháp**: Chạy câu lệnh `ALTER TABLE "ten_bang" ADD COLUMN IF NOT EXISTS "ten_cot" kieu_du_lieu`.

---

## 3. Quy tắc đặt tên bảng của Payload CMS (PostgreSQL)

Khi viết câu lệnh SQL bổ sung cấu trúc, bạn cần đặt tên bảng theo đúng quy tắc của Payload CMS:

| Loại cấu trúc | Định dạng tên bảng |
|---|---|
| Collection `my-collection` | `my_collection` |
| Global `myGlobal` | `my_global` |
| Block `myBlock` trong collection | `collection_blocks_my_block` |
| Block `myBlock` trong global | `global_blocks_my_block` |
| Array/sub-table trong block | `collection_blocks_my_block_array_name` |

---

## 4. Cấu trúc Quản lý Schema Migration trong Dự án

Dự án hiện tại sử dụng cơ chế **Single Source of Truth** (Nguồn dữ liệu duy nhất) cho toàn bộ SQL migration:

* **`scripts/migrations.mjs`**: Chứa mảng `MIGRATION_STATEMENTS` gồm tất cả các câu lệnh tạo bảng, chỉ mục (index) và cập nhật cột cần thiết cho hệ thống.
* **`migrate.mjs`**: Script chạy tự động trong CI/CD (hoặc chạy thủ công qua Node.js) để duyệt qua các câu lệnh trong `migrations.mjs` và thực thi chúng. Script có chế độ bỏ qua nếu bảng/cột đã tồn tại để tránh gây lỗi.
* **`src/app/api/db-push/route.ts`**: API route hỗ trợ kích hoạt thủ công bằng cách gọi URL:
  `GET https://ksbtdn.vercel.app/api/db-push?secret=PAYLOAD_SECRET`

---

## 5. Cấu hình CI/CD trên GitHub (BẮT BUỘC)

Để kích hoạt luồng tự động migration khi deploy, bạn cần thực hiện cấu hình Secrets trên GitHub:

1. Vào Repository của bạn trên GitHub $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Nhấn **New repository secret** để tạo 2 biến:
   * **`VERCEL_TOKEN`**: Token tài khoản Vercel của bạn (tạo tại [Vercel Token Settings](https://vercel.com/account/tokens)).
   * **`DATABASE_URI`**: Đường dẫn kết nối CSDL PostgreSQL production (`postgres://...`).

Khi bạn chạy `git push` lên nhánh `master`, GitHub Actions sẽ chạy script `migrate.mjs` để đồng bộ DB trước khi đẩy build lên Vercel.

---

## 6. Chạy Migration Thủ công (Phương án Dự phòng)

Nếu không sử dụng GitHub Actions, bạn có thể tự chạy đồng bộ cấu trúc DB thủ công theo các cách sau:

### Cách 1: Chạy trực tiếp từ máy cá nhân (Khuyên dùng khi dev)
Đảm bảo bạn đã điền đúng `DATABASE_URI` vào file `.env` local, sau đó chạy lệnh:
```bash
# Chạy script migration với cấu hình env local
node --env-file=.env migrate.mjs
```

### Cách 2: Trigger qua URL API
Gọi API route đã được mã hóa bảo mật trên production:
```
GET https://<your-domain>.vercel.app/api/db-push?secret=<PAYLOAD_SECRET_CUA_BAN>
```

---

## 7. Các bước khi thêm Block / Collection mới vào Code

Mỗi khi bạn phát triển thêm tính năng liên quan đến DB, hãy làm theo quy trình chuẩn sau:

1. **Khởi tạo code**: Thêm config Block/Collection mới vào Payload CMS code.
2. **Kiểm tra local**: Chạy `npm run dev` ở máy local để Payload tự tạo bảng trên SQLite hoặc Postgres local.
3. **Viết SQL Migration**: Thêm câu lệnh `CREATE TABLE` hoặc `ALTER TABLE` tương ứng vào mảng `MIGRATION_STATEMENTS` trong file `scripts/migrations.mjs`.
4. **Push code**: Chạy lệnh commit và push lên GitHub:
   ```bash
   git add .
   git commit -m "feat: add new banner block and migration schema"
   git push origin master
   ```
5. **Theo dõi**: GitHub Actions sẽ tự chạy migration và deploy ứng dụng lên Vercel sạch lỗi 500.

---

*Tài liệu hướng dẫn được cập nhật ngày 11/06/2026 bởi Antigravity*
