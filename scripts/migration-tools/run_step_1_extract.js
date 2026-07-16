const fs = require('fs');

console.log("1. Đọc file SQL từ khách hàng...");
const sqlPath = 'C:\\Users\\SingPC\\Downloads\\ksbtdana6a10_home_1784023530.sql';
if (!fs.existsSync(sqlPath)) {
    console.error("Không tìm thấy tệp SQL:", sqlPath);
    process.exit(1);
}
const sql = fs.readFileSync(sqlPath, 'utf8');

function extractTable(tableName) {
    const insertStr = `INSERT INTO \`${tableName}\` VALUES`;
    let startIdx = sql.indexOf(insertStr);
    if (startIdx === -1) {
        startIdx = sql.indexOf(`INSERT INTO \`${tableName}\``);
        if (startIdx === -1) return '';
    }
    
    let nextInsertIdx = sql.indexOf('INSERT INTO `', startIdx + 10);
    let endIdx = nextInsertIdx !== -1 ? nextInsertIdx : sql.length;
    
    let unlockIdx = sql.indexOf('UNLOCK TABLES;', startIdx);
    if (unlockIdx !== -1 && unlockIdx < endIdx) {
        endIdx = unlockIdx;
    }
    
    return sql.substring(startIdx, endIdx);
}

console.log("2. Trích xuất bảng dữ liệu...");
const rowsStr = extractTable('tms_vi_news_rows');
// Nukeviet 4.x có 2 bảng lưu nội dung: tms_vi_news_detail hoặc tms_vi_news_bodytext
let detailsStr = extractTable('tms_vi_news_detail');
if (!detailsStr) detailsStr = extractTable('tms_vi_news_bodytext');
if (!detailsStr) detailsStr = extractTable('tms_vi_news_bodyhtml');

if (!rowsStr || !detailsStr) {
    console.error("Không tìm thấy bảng tin tức trong file SQL.");
    process.exit(1);
}

fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', rowsStr + '\n\n' + detailsStr);
console.log(`Đã trích xuất thành công: rows length = ${rowsStr.length}, details length = ${detailsStr.length}`);
