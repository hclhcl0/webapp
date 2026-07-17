import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

function toSlug(str: string) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  return str.replace(/^-+/g, '').replace(/-+$/g, '');
}

const CATEGORIES = [
  "Tay chân miệng",
  "Sốt xuất huyết - Chikungunya",
  "Khám sức khỏe định kỳ cho người dân năm 2026",
  "Biến đổi khí hậu và Sức khỏe cộng đồng",
  "Bệnh cúm",
  "Bệnh cúm gia cầm",
  "Bệnh hô hấp",
  "Bệnh lao",
  "Bệnh phổi tắc nghẽn mạn tính",
  "Bệnh Sởi",
  "Bệnh Dại",
  "Đau mắt đỏ",
  "Đậu mùa khỉ",
  "Ho gà",
  "Marburg",
  "HIV/AIDS",
  "Phòng, chống tác hại thuốc lá",
  "Đột quỵ",
  "Tim mạch",
  "Đái tháo đường",
  "Cong vẹo cột sống",
  "Dinh dưỡng",
  "Y tế trường học",
  "Người cao tuổi",
  "Chăm sóc trẻ em",
  "Sức khỏe sinh sản",
  "Nuôi con bằng sữa mẹ",
  "Sức khoẻ người lao động",
  "Tiêm chủng"
];

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });

    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    if (secret !== 'vnos-cdc-seed') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find parent category
    let parentRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'suc-khoe' } },
      limit: 1,
    });

    let parentId;
    if (parentRes.totalDocs > 0) {
      parentId = parentRes.docs[0].id;
    } else {
      const newParent = await payload.create({
        collection: 'categories',
        data: {
          name: 'Sức khỏe',
          slug: 'suc-khoe',
        }
      });
      parentId = newParent.id;
    }

    const created = [];
    const skipped = [];

    for (const name of CATEGORIES) {
      const slug = toSlug(name);
      
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
      });

      if (existing.totalDocs > 0) {
        skipped.push(name);
        continue;
      }

      const cat = await payload.create({
        collection: 'categories',
        data: {
          name,
          slug,
          parent: parentId
        }
      });
      created.push(name);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} categories, skipped ${skipped.length}`,
      created,
      skipped,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
