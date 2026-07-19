const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URI
});

const sql = `
DO $$
DECLARE
    fk RECORD;
    col RECORD;
BEGIN
    CREATE TEMP TABLE temp_fk_defs (
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
        INSERT INTO temp_fk_defs VALUES (fk.table_name, fk.constraint_name, fk.column_name, fk.foreign_table_name, fk.foreign_column_name);
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
        FROM temp_fk_defs
    ) LOOP
        EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "' || col.column_name || '" TYPE varchar USING "' || col.column_name || '"::varchar';
    END LOOP;

    FOR fk IN (
        SELECT * FROM temp_fk_defs
    ) LOOP
        EXECUTE 'ALTER TABLE "' || fk.table_name || '" ADD CONSTRAINT "' || fk.constraint_name || '" FOREIGN KEY ("' || fk.column_name || '") REFERENCES "' || fk.foreign_table_name || '" ("' || fk.foreign_column_name || '") ON DELETE cascade ON UPDATE no action';
    END LOOP;

    DROP TABLE temp_fk_defs;
END $$;
`;

async function run() {
  try {
    console.log("Running migration logic...");
    await pool.query(sql);
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

run();
