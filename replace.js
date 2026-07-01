const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('D:/CDC/webcq/next-frontend/src');
let changedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("slug: 'settings'")) {
        content = content.replace(/slug:\s*'settings'/g, "slug: 'site-settings'");
        fs.writeFileSync(file, content);
        changedCount++;
        console.log('Updated:', file);
    }
});
console.log('Total files updated:', changedCount);
