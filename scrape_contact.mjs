async function scrape() {
  const res = await fetch('https://ksbtdanang.vn/co-cau-to-chuc/');
  const html = await res.text();
  
  const blocks = html.split('class="org-item"');
  for (const block of blocks) {
    if (!block.includes('class="title"')) continue;
    
    let name = '';
    const nameMatch = block.match(/class="title"[^>]*>\s*<a[^>]*>(.*?)<\/a>/);
    if (nameMatch) name = nameMatch[1].trim();
    
    let phone = '';
    const phoneMatch = block.match(/Điện thoại:.*?([\d\s.]{8,})/);
    if (phoneMatch) phone = phoneMatch[1].trim();
    
    let email = '';
    const emailMatch = block.match(/Email:.*?([\w.-]+@[\w.-]+\.\w+)/);
    if (emailMatch) email = emailMatch[1].trim();
    
    if (name) {
      console.log(JSON.stringify({ name, phone, email }));
    }
  }
}

scrape();
