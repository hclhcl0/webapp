const fs = require('fs');

const plpgsql = `
  // ====================================================
  // BATCH: Convert all block and array ids from integer (serial) to varchar
  // Payload v3 generates String UUIDs for block/array IDs natively,
  // but they were originally created as serial integers in older migrations.
  // This PL/pgSQL block dynamically drops FKs, alters the types, and recreates the FKs.
  // ====================================================
  \`DO $$
  DECLARE
      fk RECORD;
      col RECORD;
  BEGIN
      CREATE TEMP TABLE temp_fk_defs_dynamic (
          table_name text,
          constraint_name text,
          column_name text,
          foreign_table_name text,
          foreign_column_name text
      );
  
      FOR fk IN (
          SELECT 
              tc.table_name, 
              tc.constraint_name, 
              kcu.column_name, 
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND (ccu.table_name LIKE '%\\_blocks\\_%' OR ccu.table_name LIKE '%\\_array\\_%')
            AND ccu.column_name = 'id'
      ) LOOP
          INSERT INTO temp_fk_defs_dynamic VALUES (fk.table_name, fk.constraint_name, fk.column_name, fk.foreign_table_name, fk.foreign_column_name);
          EXECUTE 'ALTER TABLE "' || fk.table_name || '" DROP CONSTRAINT "' || fk.constraint_name || '"';
      END LOOP;
  
      FOR col IN (
          SELECT table_name, column_name 
          FROM information_schema.columns 
          WHERE column_name = 'id' AND data_type = 'integer' 
            AND (table_name LIKE '%\\_blocks\\_%' OR table_name LIKE '%\\_array\\_%')
      ) LOOP
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "id" DROP DEFAULT';
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "id" TYPE varchar USING id::varchar';
      END LOOP;
  
      FOR col IN (
          SELECT DISTINCT table_name, column_name 
          FROM temp_fk_defs_dynamic
      ) LOOP
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "' || col.column_name || '" TYPE varchar USING "' || col.column_name || '"::varchar';
      END LOOP;
  
      FOR fk IN (
          SELECT * FROM temp_fk_defs_dynamic
      ) LOOP
          EXECUTE 'ALTER TABLE "' || fk.table_name || '" ADD CONSTRAINT "' || fk.constraint_name || '" FOREIGN KEY ("' || fk.column_name || '") REFERENCES "' || fk.foreign_table_name || '" ("' || fk.foreign_column_name || '") ON DELETE cascade ON UPDATE no action';
      END LOOP;
  
      DROP TABLE temp_fk_defs_dynamic;
  EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error occurred: %', SQLERRM;
      DROP TABLE IF EXISTS temp_fk_defs_dynamic;
  END $$;\`,
`;

const path = 'scripts/migrations.mjs';
let content = fs.readFileSync(path, 'utf8');
const lastBracket = content.lastIndexOf('];');
if (lastBracket !== -1) {
    content = content.substring(0, lastBracket) + plpgsql + '\n];' + content.substring(lastBracket + 2);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully appended!");
} else {
    console.error("Could not find ];");
}
