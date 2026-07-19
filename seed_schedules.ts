import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

const tiengVietTiemChung = `
  <p><strong>LỊCH TIÊM CHỦNG</strong></p>
  <p><strong>* Từ thứ 2 đến thứ 6:</strong></p>
  <ul>
    <li>Buổi sáng: 7 giờ 15 phút đến 11 giờ 00 phút.</li>
    <li>Buổi chiều: 12 giờ 45 phút đến 16 giờ 30 phút.</li>
  </ul>
  <p><strong>* Riêng thứ 7, Chủ nhật, ngày Lễ, Tết chỉ tiêm chủng buổi sáng:</strong></p>
  <ul>
    <li>7 giờ 15 phút đến 11 giờ 00 phút</li>
  </ul>
  <p><strong>* Thời gian lấy số thứ tự:</strong></p>
  <ul>
    <li>Buổi sáng: Bắt đầu từ 7 giờ 00 phút.</li>
    <li>Buổi chiều: Bắt đầu từ 13 giờ 00 phút.</li>
  </ul>
  <p><em>Mỗi khách hàng chỉ lấy 01 số thứ tự</em></p>
`;

const tiengVietXetNghiem = `
  <p><strong>LỊCH XÉT NGHIỆM</strong></p>
  <p><strong>* Từ thứ 2 đến thứ 6:</strong></p>
  <ul>
    <li>Buổi sáng: 7 giờ 30 phút đến 11 giờ 00 phút.</li>
    <li>Buổi chiều: 13 giờ 30 phút đến 16 giờ 30 phút.</li>
  </ul>
  <p><strong>* Thứ 7, Chủ nhật chỉ làm việc buổi sáng; ngày Lễ, Tết: nghỉ.</strong></p>
`;

// Simple HTML to Lexical for this specific structure
function simpleHtmlToLexical(html) {
  const root = { type: 'root', format: '', indent: 0, version: 1, children: [] };
  
  // Basic parsing for this specific content
  const lines = html.split('\n').map(l => l.trim()).filter(l => l);
  let currentList = null;
  
  for (const line of lines) {
    if (line.startsWith('<p>')) {
      if (currentList) {
        root.children.push(currentList);
        currentList = null;
      }
      let text = line.replace(/<\/?p>/g, '');
      let format = 0;
      if (text.includes('<strong>')) {
        format = 1; // bold
        text = text.replace(/<\/?strong>/g, '');
      }
      if (text.includes('<em>')) {
        format = 2; // italic
        text = text.replace(/<\/?em>/g, '');
      }
      
      root.children.push({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, mode: 'normal', text, format }]
      });
    } else if (line.startsWith('<ul>')) {
      currentList = { type: 'list', listType: 'bullet', start: 1, version: 1, children: [] };
    } else if (line.startsWith('</ul>')) {
      if (currentList) {
        root.children.push(currentList);
        currentList = null;
      }
    } else if (line.startsWith('<li>')) {
      const text = line.replace(/<\/?li>/g, '');
      if (currentList) {
        currentList.children.push({
          type: 'listitem',
          version: 1,
          value: 1,
          children: [{ type: 'text', version: 1, mode: 'normal', text, format: 0 }]
        });
      }
    }
  }
  
  if (currentList) {
    root.children.push(currentList);
  }
  
  return root;
}


async function run() {
  console.log('Initializing payload...');
  const payload = await getPayload({ config: configPromise });

  const pages = [
    {
      title: 'Lịch tiêm chủng',
      slug: 'lich-tiem-chung',
      pageType: 'standard',
      layout: 'narrow',
      content: [
        {
          blockType: 'richTextSection',
          content: simpleHtmlToLexical(tiengVietTiemChung),
        }
      ]
    },
    {
      title: 'Lịch xét nghiệm',
      slug: 'lich-xet-nghiem',
      pageType: 'standard',
      layout: 'narrow',
      content: [
        {
          blockType: 'richTextSection',
          content: simpleHtmlToLexical(tiengVietXetNghiem),
        }
      ]
    }
  ];

  for (const page of pages) {
    // Check if exists
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } }
    });

    if (existing.docs.length > 0) {
      console.log(`Updating existing page: ${page.title}`);
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: page,
      });
    } else {
      console.log(`Creating new page: ${page.title}`);
      await payload.create({
        collection: 'pages',
        data: page,
      });
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
