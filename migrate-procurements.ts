import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

// Cấu hình (theo yêu cầu của user)
const CONFIG = {
  // 1. Phạm vi: chuyển toàn bộ dữ liệu
  filterKeyword: '', 
  
  // 2. Xóa bản gốc sau khi chuyển
  deleteOriginal: true,
  
  // 3. Trạng thái mặc định
  defaultStatus: 'closed', // Đã đóng
  
  // 4. Phân loại mua sắm mặc định
  defaultType: 'thu-moi-chao-gia',
};

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log('🚀 Bắt đầu quá trình Migration Documents -> Procurements');
  console.log(`Chế độ: ${isDryRun ? 'DRY RUN (Không lưu vào DB)' : 'THỰC THI (Sẽ ghi vào DB)'}`);
  
  const payload = await getPayload({ config: configPromise });
  
  // Lấy tất cả văn bản (giới hạn 1000)
  const documents = await payload.find({
    collection: 'documents',
    limit: 1000,
  });

  console.log(`Tìm thấy tổng cộng ${documents.docs.length} văn bản trong database.`);
  
  // Chuyển toàn bộ dữ liệu
  const docsToMigrate = documents.docs;

  console.log(`\n📄 Sẽ chuyển đổi toàn bộ ${docsToMigrate.length} văn bản.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const doc of docsToMigrate) {
    console.log(`- Đang xử lý: [${doc.documentNumber || 'Không số'}] ${doc.title}`);
    
    // Auto-detect loại mua sắm dựa vào tiêu đề
    let procurementType = CONFIG.defaultType;
    const titleLower = doc.title.toLowerCase();
    if (titleLower.includes('kết quả') && titleLower.includes('thầu')) {
      procurementType = 'ket-qua-lua-chon';
    } else if (titleLower.includes('mời thầu') || titleLower.includes('đấu thầu')) {
      procurementType = 'moi-thau';
    } else if (titleLower.includes('chào giá')) {
      procurementType = 'thu-moi-chao-gia';
    } else if (titleLower.includes('thông báo')) {
      procurementType = 'thong-bao';
    } else if (titleLower.includes('báo cáo')) {
      procurementType = 'bao-cao';
    }

    const newProcurementData: any = {
      title: doc.title,
      documentNumber: doc.documentNumber,
      procurementType: procurementType,
      status: CONFIG.defaultStatus,
      publishedDate: doc.publishedDate || new Date().toISOString(),
      deadline: doc.expiryDate,
      file: typeof doc.file === 'object' ? doc.file?.id : doc.file,
      driveUrl: doc.driveUrl,
      note: `Được chuyển từ mục Văn Bản (Loại cũ: ${doc.documentType || 'Không'} - Cơ quan: ${doc.issuer || 'Không'})`,
    };

    if (isDryRun) {
      console.log(`  > (DRY RUN) Sẽ tạo procurement loại: ${procurementType}, trạng thái: ${CONFIG.defaultStatus}`);
      if (CONFIG.deleteOriginal) {
        console.log(`  > (DRY RUN) Sẽ xóa document ID: ${doc.id}`);
      }
    } else {
      try {
        await payload.create({
          collection: 'procurements',
          data: newProcurementData,
        });
        
        if (CONFIG.deleteOriginal) {
          await payload.delete({
            collection: 'documents',
            id: doc.id,
          });
          console.log(`  > Đã tạo Procurements và xóa Document cũ thành công.`);
        } else {
          console.log(`  > Đã tạo Procurements thành công (giữ lại bản gốc).`);
        }
        successCount++;
      } catch (err: any) {
        console.error(`  > LỖI khi chuyển document ${doc.id}: ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n==================================');
  if (isDryRun) {
    console.log(`✅ Hoàn thành phân tích DRY RUN. Mở script bỏ cờ --dry-run để chạy thật.`);
  } else {
    console.log(`✅ Chuyển đổi hoàn tất! Thành công: ${successCount} | Lỗi: ${errorCount}`);
  }
  process.exit(0);
}

runMigration();
