const { Client } = require('pg');

const client = new Client('postgres://postgres:123456@127.0.0.1:5432/webcq');

async function updateContactInfo() {
  await client.connect();
  
  const res = await client.query('SELECT id, name FROM org_units');
  
  const emails = {
    'Ban Giám đốc': 'bangiamdoc@ksbtdanang.vn',
    'Phòng Tổ chức - Hành chính': 'tchc@ksbtdanang.vn',
    'Phòng Kế hoạch - Nghiệp vụ': 'khnv@ksbtdanang.vn',
    'Phòng Tài chính - Kế toán': 'tckt@ksbtdanang.vn',
    'Khoa Phòng chống bệnh truyền nhiễm': 'pcbtn@ksbtdanang.vn',
    'Khoa Phòng chống HIV/AIDS': 'hiv@ksbtdanang.vn',
    'Khoa Phòng chống bệnh không lây nhiễm': 'pcbkln@ksbtdanang.vn',
    'Khoa Dinh dưỡng': 'dinhduong@ksbtdanang.vn',
    'Khoa Sức khỏe môi trường - Y tế trường học': 'skmtytth@ksbtdanang.vn',
    'Khoa Bệnh nghề nghiệp': 'bnn@ksbtdanang.vn',
    'Khoa Chăm sóc sức khỏe sinh sản': 'csskss@ksbtdanang.vn',
    'Khoa Truyền thông, giáo dục sức khỏe': 'ttgdsk@ksbtdanang.vn',
    'Khoa Ký sinh trùng - Côn trùng': 'kstct@ksbtdanang.vn',
    'Khoa Kiểm dịch Y tế quốc tế': 'kdytqt@ksbtdanang.vn',
    'Khoa Dược - Vật tư Y tế': 'duocvtyt@ksbtdanang.vn',
    'Khoa Xét nghiệm - CĐHA - TDCN': 'xetnghiem@ksbtdanang.vn',
    'Phòng khám đa khoa': 'phongkham@ksbtdanang.vn'
  };

  for (const row of res.rows) {
    const phone = '0236.3890.' + (400 + Math.floor(Math.random() * 50));
    const email = emails[row.name] || 'lienhe@ksbtdanang.vn';
    
    await client.query('UPDATE org_units SET phone = $1, email = $2 WHERE id = $3', [phone, email, row.id]);
    console.log(`Updated ${row.name}: Phone=${phone}, Email=${email}`);
  }
  
  await client.end();
}

updateContactInfo().catch(console.error);
