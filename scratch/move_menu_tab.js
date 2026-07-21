const fs = require('fs');
const code = fs.readFileSync('src/globals/SiteSettings.ts', 'utf-8');

const nameMenuIndex = code.indexOf("name: 'menu',");
if (nameMenuIndex === -1) { console.log('Could not find name menu'); process.exit(1); }

// Go back to the `{` before type: 'group'
const blockStartIndex = code.lastIndexOf('{', nameMenuIndex);
// And the `// ────...` before it
const commentIndex = code.lastIndexOf('// ──', blockStartIndex);
const startIndex = commentIndex !== -1 ? commentIndex : blockStartIndex;

const nameFooterIndex = code.indexOf("name: 'footer',");
if (nameFooterIndex === -1) { console.log('Could not find name footer'); process.exit(1); }

const footerBlockStartIndex = code.lastIndexOf('{', nameFooterIndex);
const footerCommentIndex = code.lastIndexOf('// ──', footerBlockStartIndex);
const endIndex = footerCommentIndex !== -1 ? footerCommentIndex : footerBlockStartIndex;

// The block to extract
let menuBlock = code.substring(startIndex, endIndex);

// Remove the extracted block from its original position
let newCode = code.substring(0, startIndex) + code.substring(endIndex);

// Find where to insert the new tab.
// The end of 'Thành phần dùng chung' tab is just before 'Giao diện & Thanh bên'
const insertStr = `label: 'Giao diện & Thanh bên',`;
const insertIndex = newCode.indexOf(insertStr);
if (insertIndex === -1) { console.log('Could not find insert index'); process.exit(1); }
const insertTabStartIndex = newCode.lastIndexOf('{', insertIndex);

// Construct the new tab block
const newTabBlock = `        {\n          label: 'Menu',\n          fields: [\n    ` +
  menuBlock.replace(/.*\/\/.*────────.*/g, '').trimStart() +
  `\n          ]\n        },\n`;

// Insert the new tab
newCode = newCode.substring(0, insertTabStartIndex) + newTabBlock + newCode.substring(insertTabStartIndex);

fs.writeFileSync('src/globals/SiteSettings.ts', newCode);
console.log('Successfully moved Menu to a new tab!');
