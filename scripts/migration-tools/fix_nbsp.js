const { Client } = require('pg');

async function fixSpaces() {
  const c = new Client('postgresql://postgres:123456@127.0.0.1:5432/webcq');
  await c.connect();
  try {
    const { rows } = await c.query(`SELECT id, content FROM articles`);
    let updated = 0;
    
    for (const row of rows) {
      if (!row.content || !row.content.root) continue;
      
      let changed = false;
      
      // Đệ quy để tìm và replace text trong Lexical JSON
      function traverse(nodes) {
        if (!nodes) return;
        for (const node of nodes) {
          if (node.type === 'text' && node.text) {
            const oldText = node.text;
            let newText = oldText.replace(/&nbsp;/g, ' ')
                                 .replace(/&amp;/g, '&')
                                 .replace(/&lt;/g, '<')
                                 .replace(/&gt;/g, '>')
                                 .replace(/&quot;/g, '"')
                                 .replace(/&#39;/g, "'")
                                 .replace(/&#039;/g, "'")
                                 .replace(/&#x2F;/gi, "/")
                                 .replace(/&#x3A;/gi, ":");
            // Xóa khoảng trắng thừa ở đầu/cuối đoạn
            newText = newText.trim();
            
            if (newText !== oldText) {
              node.text = newText;
              changed = true;
            }
          }
          if (node.children) {
            traverse(node.children);
          }
        }
      }
      
      traverse(row.content.root.children);
      
      if (changed) {
        await c.query('UPDATE articles SET content = $1 WHERE id = $2', [row.content, row.id]);
        updated++;
      }
    }
    
    console.log(`Đã sửa lỗi &nbsp; cho ${updated} bài viết trong DB!`);
  } finally {
    await c.end();
  }
}

fixSpaces().catch(console.error);
