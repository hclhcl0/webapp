import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'chuyen-du-lieu-123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config: configPromise });
    
    // 1. Lấy tất cả văn bản
    const documents = await payload.find({
      collection: 'documents',
      limit: 1000,
    });
    
    const docsToMigrate = documents.docs;
    let successCount = 0;
    let errorCount = 0;
    let logs = [];

    logs.push(`🚀 Bắt đầu chuyển đổi ${docsToMigrate.length} bản ghi...`);

    for (const doc of docsToMigrate) {
      let procurementType = 'thu-moi-chao-gia';
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
        status: 'closed', // User requested: "Đã đóng"
        publishedDate: doc.publishedDate || new Date().toISOString(),
        deadline: doc.expiryDate,
        file: typeof doc.file === 'object' ? doc.file?.id : doc.file,
        driveUrl: doc.driveUrl,
        note: `Chuyển từ Văn Bản (Cơ quan: ${doc.issuer || 'Không'})`,
      };

      try {
        await payload.create({
          collection: 'procurements',
          data: newProcurementData,
        });
        
        // Delete original (User requested: xóa bỏ bản gốc)
        await payload.delete({
          collection: 'documents',
          id: doc.id,
        });
        
        successCount++;
        logs.push(`✅ Thành công: ${doc.title}`);
      } catch (err: any) {
        errorCount++;
        logs.push(`❌ Lỗi [${doc.title}]: ${err.message}`);
      }
    }

    logs.push(`🎉 Hoàn tất! Chuyển thành công: ${successCount}, Lỗi: ${errorCount}`);

    return NextResponse.json({ success: true, successCount, errorCount, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
