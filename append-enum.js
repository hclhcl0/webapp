const fs = require('fs');
const filepath = 'scripts/migrations.mjs';
let content = fs.readFileSync(filepath, 'utf8');

// Find the last occurrence of `];`
const lastBracketIdx = content.lastIndexOf('];');
if (lastBracketIdx !== -1) {
    const newQuery = `\n  \`ALTER TYPE enum_banners_position ADD VALUE IF NOT EXISTS 'vaccine_slider';\`\n`;
    
    // Add comma to the previous item if necessary.
    // The previous item is before `];`
    let beforeBracket = content.substring(0, lastBracketIdx).trimEnd();
    if (!beforeBracket.endsWith(',')) {
        beforeBracket += ',';
    }
    
    const newContent = beforeBracket + newQuery + '];' + content.substring(lastBracketIdx + 2);
    fs.writeFileSync(filepath, newContent);
    console.log('Appended to migrations.mjs successfully.');
} else {
    console.log('Could not find ];');
}
