import fetch from 'node-fetch';
import { parseHTML } from 'linkedom';

const BASE_URL = 'https://ksbtdanang.vn';
const API_BASE = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'hclhcl0@gmail.com';
const ADMIN_PASSWORD = '123456';

const DEPARTMENTS = [
  { name: 'Ban Giám đốc', url: '/co-cau-to-chuc/vieworg/Ban-giam-doc-15/', type: 'ban_lanh_dao', order: 1 },
  { name: 'Phòng Tổ chức - Hành chính', url: '/co-cau-to-chuc/vieworg/Phong-To-chuc-Hanh-chinh-23/', type: 'phong', order: 2 },
  { name: 'Phòng Kế hoạch - Nghiệp vụ', url: '/co-cau-to-chuc/vieworg/Phong-Ke-hoach-Nghiep-vu-22/', type: 'phong', order: 3 },
  { name: 'Phòng Tài chính - Kế toán', url: '/co-cau-to-chuc/vieworg/Phong-Tai-chinh-Ke-toan-24/', type: 'phong', order: 4 },
  { name: 'Khoa Phòng chống bệnh truyền nhiễm', url: '/co-cau-to-chuc/vieworg/Khoa-Phong-chong-benh-truyen-nhiem-25/', type: 'khoa', order: 5 },
  { name: 'Khoa Phòng chống HIV/AIDS', url: '/co-cau-to-chuc/vieworg/Khoa-phong-chong-HIV-AIDS-33/', type: 'khoa', order: 6 },
  { name: 'Khoa Phòng chống bệnh không lây nhiễm', url: '/co-cau-to-chuc/vieworg/Khoa-phong-chong-benh-khong-lay-nhiem-36/', type: 'khoa', order: 7 },
  { name: 'Khoa Dinh dưỡng', url: '/co-cau-to-chuc/vieworg/Khoa-Dinh-duong-29/', type: 'khoa', order: 8 },
  { name: 'Khoa Sức khỏe môi trường - Y tế trường học', url: '/co-cau-to-chuc/vieworg/Khoa-Suc-khoe-moi-truong-Y-te-truong-hoc-27/', type: 'khoa', order: 9 },
  { name: 'Khoa Bệnh nghề nghiệp', url: '/co-cau-to-chuc/vieworg/Khoa-Benh-nghe-nghiep-28/', type: 'khoa', order: 10 },
  { name: 'Khoa Chăm sóc sức khỏe sinh sản', url: '/co-cau-to-chuc/vieworg/Khoa-cham-soc-suc-khoe-sinh-san-30/', type: 'khoa', order: 11 },
  { name: 'Khoa Truyền thông, giáo dục sức khỏe', url: '/co-cau-to-chuc/vieworg/Khoa-Truyen-thong-giao-duc-suc-khoe-34/', type: 'khoa', order: 12 },
  { name: 'Khoa Ký sinh trùng - Côn trùng', url: '/co-cau-to-chuc/vieworg/Khoa-Ky-sinh-trung-Con-trung-31/', type: 'khoa', order: 13 },
  { name: 'Khoa Kiểm dịch Y tế quốc tế', url: '/co-cau-to-chuc/vieworg/Khoa-Kiem-dich-Y-te-quoc-te-32/', type: 'khoa', order: 14 },
  { name: 'Khoa Dược - Vật tư Y tế', url: '/co-cau-to-chuc/vieworg/Khoa-Duoc-Vat-tu-Y-te-37/', type: 'khoa', order: 15 },
  { name: 'Khoa Xét nghiệm - CĐHA - TDCN', url: '/co-cau-to-chuc/vieworg/Khoa-Xet-nghiem-CDHA-TDCN-35/', type: 'khoa', order: 16 },
  { name: 'Phòng khám đa khoa', url: '/co-cau-to-chuc/vieworg/Phong-kham-da-khoa-26/', type: 'khoa', order: 17 },
];

// Map index của hàng trong bảng person sang chức vụ
// Mỗi người có bảng riêng với các dòng: [0]=chức vụ+tên, [1]=trình độ, [2]=điện thoại, [3]=email
function mapPositionFromRow(rowIdx, deptType) {
  if (deptType === 'ban_lanh_dao') {
    if (rowIdx === 0) return 'giam_doc';
    return 'pho_giam_doc';
  }
  if (rowIdx === 0) return 'truong';
  return 'pho_truong';
}

async function fetchWin1252(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  // Trang web dùng UTF-8, lấy text trực tiếp
  return await res.text();
}

async function login() {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const data = await res.json();
  if (!data.token) { console.error('Login failed'); process.exit(1); }
  console.log('✅ Đăng nhập thành công!\n');
  return data.token;
}

async function uploadImageFromUrl(imgSrc, memberName, token) {
  if (!imgSrc) return null;
  try {
    const fullUrl = imgSrc.startsWith('http') ? imgSrc : BASE_URL + imgSrc;
    const res = await fetch(fullUrl);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const rawExt = imgSrc.split('.').pop().split('?')[0].toLowerCase();
    const ext = ['jpg','jpeg','png','gif','webp'].includes(rawExt) ? rawExt : 'jpg';
    const filename = `org-${memberName.replace(/[^a-zA-Z0-9]/g, '-')}.${ext}`;
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Dùng multipart form với boundary thủ công
    const boundary = `----FormBoundary${Date.now()}`;
    const CRLF = '\r\n';
    
    const metaPart = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="alt"${CRLF}${CRLF}` +
      `Ảnh chân dung ${memberName}${CRLF}`
    );
    const fileHeader = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
      `Content-Type: ${mime}${CRLF}${CRLF}`
    );
    const closing = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
    const body = Buffer.concat([metaPart, fileHeader, buffer, closing]);

    const uploadRes = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    const uploadData = await uploadRes.json();
    if (uploadData.doc?.id) {
      console.log(`    🖼️  Ảnh: ${filename}`);
      return uploadData.doc.id;
    }
  } catch (e) {
    console.error(`    ⚠️  Lỗi ảnh:`, e.message);
  }
  return null;
}

async function scrapeDepartment(dept) {
  console.log(`\n📋 Quét: ${dept.name}`);
  const html = await fetchWin1252(BASE_URL + dept.url);
  const { document } = parseHTML(html);
  
  const persons = [];
  
  // Lấy tất cả link /person/ trong trang - đây là cách chắc nhất
  // Mỗi link /person/ chứa tên người, và có thể có ảnh kế bên
  const personLinks = document.querySelectorAll('a[href*="/person/"]');
  const seen = new Set();
  let personIdx = 0;

  for (const link of personLinks) {
    const href = link.getAttribute('href') || '';
    if (seen.has(href)) continue;
    seen.add(href);

    const memberName = link.textContent.trim();
    if (!memberName || memberName.length < 2) continue;

    // Tìm ảnh: ảnh nằm trong <td> cùng hàng hoặc link kề bên
    let imgSrc = '';
    // Ảnh avatar thường trong 1 link <a> chứa <img>
    const imgInLink = link.querySelector('img');
    if (imgInLink) {
      imgSrc = imgInLink.getAttribute('src') || '';
    } else {
      // Tìm ảnh trong cùng hàng <tr>
      const tr = link.closest('tr');
      if (tr) {
        const img = tr.querySelector('img');
        if (img) imgSrc = img.getAttribute('src') || '';
      }
    }

    // Tìm ảnh từ link <a> bọc ngoài chứa cả img lẫn text (thường là link ảnh)
    if (!imgSrc) {
      const siblingLinks = document.querySelectorAll(`a[href="${href}"]`);
      for (const sl of siblingLinks) {
        const img = sl.querySelector('img');
        if (img) { imgSrc = img.getAttribute('src') || ''; break; }
      }
    }

    // Chức vụ: xác định theo thứ tự xuất hiện trong đơn vị
    const position = mapPositionFromRow(personIdx, dept.type);
    
    persons.push({ memberName, imgSrc, position });
    console.log(`  👤 ${memberName}`);
    personIdx++;
  }

  return persons;
}

async function deleteAllOrgUnits(token) {
  const res = await fetch(`${API_BASE}/org-units?limit=100`, {
    headers: { 'Authorization': `JWT ${token}` }
  });
  const data = await res.json();
  if (data.docs?.length > 0) {
    console.log(`🗑️  Xóa ${data.docs.length} đơn vị cũ...`);
    for (const doc of data.docs) {
      await fetch(`${API_BASE}/org-units/${doc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `JWT ${token}` }
      });
    }
  }
}

async function main() {
  console.log('🚀 Import Cơ cấu tổ chức từ ksbtdanang.vn\n');
  const token = await login();
  await deleteAllOrgUnits(token);

  let totalMembers = 0;

  for (const dept of DEPARTMENTS) {
    const persons = await scrapeDepartment(dept);
    const members = [];

    for (const p of persons) {
      const avatarId = await uploadImageFromUrl(p.imgSrc, p.memberName, token);
      members.push({
        memberName: p.memberName,
        position: p.position,
        avatar: avatarId || undefined,
      });
      totalMembers++;
    }

    const res = await fetch(`${API_BASE}/org-units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify({ name: dept.name, unitType: dept.type, order: dept.order, members }),
    });
    const data = await res.json();
    if (data.doc?.id) {
      console.log(`  ✅ ${dept.name} (${members.length} nhân sự)`);
    } else {
      console.error(`  ❌ Lỗi:`, JSON.stringify(data));
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n🎉 Hoàn thành! ${DEPARTMENTS.length} đơn vị, ${totalMembers} nhân sự.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
