const fs = require('fs');
const content = fs.readFileSync('scripts/migrations.mjs', 'utf8');

// Find all CREATE TABLE IF NOT EXISTS "table_name"
const tableRegex = /CREATE TABLE IF NOT EXISTS "([^"]+)" \(([^)]+)\)/g;
let match;
const blockTables = [];

while ((match = tableRegex.exec(content)) !== null) {
  const tableName = match[1];
  const tableBody = match[2];

  // If it's a block or array table (has _parent_id) AND has "id" serial
  if (tableName.includes('_blocks_') || tableName.includes('_array_') || tableBody.includes(' "_parent_id" ')) {
    if (tableBody.includes('"id" serial')) {
      blockTables.push(tableName);
    }
  }
}

console.log("Found " + blockTables.length + " tables to migrate.");

const sqlStatements = [];
sqlStatements.push(`  // ====================================================`);
sqlStatements.push(`  // BATCH: Convert block and array ids from serial to varchar`);
sqlStatements.push(`  // Payload v3 generates String UUIDs for block/array IDs,`);
sqlStatements.push(`  // but they were originally created as serial integers.`);
sqlStatements.push(`  // ====================================================`);

for (const tableName of blockTables) {
  sqlStatements.push(`  \`ALTER TABLE "${tableName}" ALTER COLUMN "id" DROP DEFAULT\`,`);
  sqlStatements.push(`  \`ALTER TABLE "${tableName}" ALTER COLUMN "id" TYPE varchar USING id::varchar\`,`);
}

fs.writeFileSync('scratch/generate_alters.js.json', JSON.stringify(blockTables, null, 2));
fs.writeFileSync('scratch/alters.sql', sqlStatements.join('\n'));

console.log("SQL statements generated in scratch/alters.sql");
