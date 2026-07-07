const readline = require('readline');

const LOCAL_API = 'http://127.0.0.1:3000/api';
const PROD_API = 'https://ecdc.vnos.org/api';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log("=== ĐỒNG BỘ DỮ LIỆU CƠ CẤU TỔ CHỨC LÊN ECDC ===");
  console.log("Script này sẽ sao chép 100% dữ liệu phòng ban (bao gồm cả ảnh) từ máy tính của bạn lên website chính thức.");
  
  const email = await question("\nNhập tài khoản Admin trên ecdc.vnos.org (Email): ");
  const password = await question("Nhập mật khẩu Admin: ");

  console.log("\n[1/3] Đang đăng nhập vào máy chủ production...");
  const loginRes = await fetch(`${PROD_API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    console.error("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.");
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("✅ Đăng nhập thành công!");

  console.log("\n[2/3] Đang lấy danh sách Cơ cấu tổ chức từ Localhost...");
  const orgRes = await fetch(`${LOCAL_API}/org-units?limit=100`);
  const orgData = await orgRes.json();
  const orgs = orgData.docs;
  console.log(`✅ Tìm thấy ${orgs.length} phòng/khoa/ban.`);

  console.log("\n[3/3] Đang tải lên máy chủ (quá trình này có thể mất vài phút nếu có nhiều ảnh)...");
  
  const mediaMap = {}; // Lưu trữ ID ảnh đã upload để tái sử dụng nếu 2 người dùng chung ảnh

  async function uploadMedia(localMedia) {
    if (!localMedia || !localMedia.url) return null;
    if (mediaMap[localMedia.id]) return mediaMap[localMedia.id];

    console.log(`  -> Đang tải ảnh: ${localMedia.filename}...`);
    try {
      const imgRes = await fetch(`http://127.0.0.1:3000${localMedia.url}`);
      const buffer = await imgRes.arrayBuffer();

      const formData = new FormData();
      const blob = new Blob([buffer], { type: localMedia.mimeType || 'image/jpeg' });
      formData.append('file', blob, localMedia.filename);
      formData.append('alt', localMedia.alt || '');

      const uploadRes = await fetch(`${PROD_API}/media`, {
        method: 'POST',
        headers: { 'Authorization': `JWT ${token}` },
        body: formData
      });

      if (!uploadRes.ok) {
        console.log(`     ⚠️ Lỗi upload ảnh: ${uploadRes.statusText}`);
        return null;
      }
      const uploadedData = await uploadRes.json();
      mediaMap[localMedia.id] = uploadedData.doc.id;
      return uploadedData.doc.id;
    } catch (err) {
      console.log(`     ⚠️ Không thể tải ảnh: ${err.message}`);
      return null;
    }
  }

  let successCount = 0;
  for (const org of orgs) {
    console.log(`\n▶ Đang đồng bộ: ${org.name}`);
    
    // Upload ảnh đại diện phòng ban
    let prodImageId = null;
    if (org.image && typeof org.image === 'object') {
      prodImageId = await uploadMedia(org.image);
    }

    // Upload avatar nhân viên
    const members = [];
    for (const mem of (org.members || [])) {
      let prodAvatarId = null;
      if (mem.avatar && typeof mem.avatar === 'object') {
        prodAvatarId = await uploadMedia(mem.avatar);
      }
      members.push({
        ...mem,
        id: undefined, 
        avatar: prodAvatarId || undefined
      });
    }

    // Lắp ráp dữ liệu chuẩn bị gửi
    const payload = {
      ...org,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      image: prodImageId || undefined,
      members: members
    };

    const createRes = await fetch(`${PROD_API}/org-units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (createRes.ok) {
      console.log(`✅ Đồng bộ thành công: ${org.name}`);
      successCount++;
    } else {
      console.log(`❌ LỖI khi tạo: ${createRes.statusText}`);
    }
  }

  console.log(`\n🎉 HOÀN TẤT ĐỒNG BỘ! Đã đưa ${successCount}/${orgs.length} phòng/khoa lên website.`);
  process.exit(0);
}

main();
