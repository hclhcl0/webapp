import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import pg from 'pg';

const { Client } = pg;

export const MEDIA_DIR = path.resolve(process.cwd(), 'media');
export const BACKUP_ROOT_DIR = path.join(MEDIA_DIR, '.system-backups');
export const DB_BACKUP_DIR = path.join(BACKUP_ROOT_DIR, 'db');

const SAFE_BACKUP_FILENAME_RE = /^backup_db_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}\.sql\.gz$/;

export interface LocalBackupFile {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BackupProgressState {
  isRunning: boolean;
  mode: 'db' | 'media' | 'all' | null;
  phase: 'idle' | 'dumping_db' | 'uploading_db' | 'scanning_media' | 'syncing_media' | 'done' | 'error';
  message: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  dbFile: string | null;
  dbSizeBytes: number;
  mediaStats: {
    scannedFiles: number;
    totalFiles: number;
    skippedFiles: number;
    uploadedFiles: number;
    failedFiles: number;
    uploadedBytes: number;
    totalBytes: number;
    currentFile: string;
  };
  logs: string[];
}

const globalForBackup = globalThis as unknown as {
  __cdcBackupState?: BackupProgressState;
};

function createInitialState(): BackupProgressState {
  return {
    isRunning: false,
    mode: null,
    phase: 'idle',
    message: 'Sẵn sàng',
    startedAt: null,
    finishedAt: null,
    error: null,
    dbFile: null,
    dbSizeBytes: 0,
    mediaStats: {
      scannedFiles: 0,
      totalFiles: 0,
      skippedFiles: 0,
      uploadedFiles: 0,
      failedFiles: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      currentFile: '',
    },
    logs: [],
  };
}

export function getBackupState(): BackupProgressState {
  if (!globalForBackup.__cdcBackupState) {
    globalForBackup.__cdcBackupState = createInitialState();
  }
  return globalForBackup.__cdcBackupState;
}

export function appendBackupLog(line: string): void {
  const state = getBackupState();
  const timeStr = new Date().toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });
  state.logs.push(`[${timeStr}] ${line}`);
  if (state.logs.length > 150) {
    state.logs.splice(0, state.logs.length - 150);
  }
}

export function isSafeBackupFilename(name: string): boolean {
  return SAFE_BACKUP_FILENAME_RE.test(name);
}

export function resolveSafeBackupPath(filename: string): string | null {
  if (!isSafeBackupFilename(filename)) return null;
  const resolved = path.resolve(DB_BACKUP_DIR, filename);
  if (!resolved.startsWith(DB_BACKUP_DIR + path.sep)) return null;
  return resolved;
}

export function ensureBackupDirs(): void {
  fs.mkdirSync(DB_BACKUP_DIR, { recursive: true });
}

export function formatVietnamTimestampForFile(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  return `${map.year}-${map.month}-${map.day}_${map.hour}-${map.minute}-${map.second}`;
}

export function getLocalDbBackups(): LocalBackupFile[] {
  ensureBackupDirs();
  const entries = fs.readdirSync(DB_BACKUP_DIR, { withFileTypes: true });
  const files: LocalBackupFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !isSafeBackupFilename(entry.name)) continue;
    const fullPath = path.join(DB_BACKUP_DIR, entry.name);
    try {
      const stat = fs.statSync(fullPath);
      files.push({
        filename: entry.name,
        sizeBytes: stat.size,
        createdAt: stat.mtime.toISOString(),
      });
    } catch {
      // Ignore files deleted concurrently
    }
  }

  return files.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function cleanupOldLocalDbBackups(retainDays: number): number {
  ensureBackupDirs();
  const days = Math.max(1, Math.floor(retainDays || 7));
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  let removed = 0;

  for (const item of getLocalDbBackups()) {
    const fileMs = new Date(item.createdAt).getTime();
    if (fileMs < cutoffMs) {
      const fullPath = resolveSafeBackupPath(item.filename);
      if (fullPath && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        removed++;
      }
    }
  }
  return removed;
}

export async function getMediaDirectoryStats(): Promise<{ fileCount: number; totalBytes: number }> {
  let fileCount = 0;
  let totalBytes = 0;

  if (!fs.existsSync(MEDIA_DIR)) {
    return { fileCount: 0, totalBytes: 0 };
  }

  async function walk(dir: string) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.system-backups' || entry.name === '.DS_Store') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.promises.stat(full);
          fileCount++;
          totalBytes += stat.size;
        } catch {
          // Ignore transient files
        }
      }
    }
  }

  await walk(MEDIA_DIR);
  return { fileCount, totalBytes };
}

export function getDatabaseConnectionConfig(): { connectionString: string; ssl: false | { rejectUnauthorized: boolean } } | null {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) return null;

  const hasSsl =
    dbUrl.includes('sslmode=require') ||
    dbUrl.includes('db.prisma.io') ||
    dbUrl.includes('vercel-storage.com') ||
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co');

  return {
    connectionString: dbUrl,
    ssl: hasSsl ? { rejectUnauthorized: false } : false,
  };
}

export async function getDatabaseSizeBytes(): Promise<number> {
  const cfg = getDatabaseConnectionConfig();
  if (!cfg) return 0;

  const client = new Client(cfg);
  try {
    await client.connect();
    const res = await client.query<{ bytes: string }>('SELECT pg_database_size(current_database())::text AS bytes');
    return Number(res.rows[0]?.bytes || 0);
  } finally {
    await client.end().catch(() => {});
  }
}

function quoteIdent(ident: string): string {
  return `"${ident.replace(/"/g, '""')}"`;
}

function quoteSqlLiteral(raw: string): string {
  const cleaned = raw.replace(/\u0000/g, '');
  if (/[\n\r\t\\]/.test(cleaned)) {
    const escaped = cleaned
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "''")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `E'${escaped}'`;
  }
  return `'${cleaned.replace(/'/g, "''")}'`;
}

async function writeChunk(stream: NodeJS.WritableStream, text: string): Promise<void> {
  if (!stream.write(text, 'utf8')) {
    await new Promise<void>((resolve, reject) => {
      const onDrain = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        stream.removeListener('drain', onDrain);
        stream.removeListener('error', onError);
      };
      stream.once('drain', onDrain);
      stream.once('error', onError);
    });
  }
}

/**
 * Topologically order tables so parent tables are inserted before child tables.
 */
function topoSortTables(tables: string[], fkEdges: Array<{ child: string; parent: string }>): string[] {
  const deps = new Map<string, Set<string>>();
  for (const t of tables) deps.set(t, new Set());

  for (const edge of fkEdges) {
    if (edge.child !== edge.parent && deps.has(edge.child) && deps.has(edge.parent)) {
      deps.get(edge.child)!.add(edge.parent);
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const ordered: string[] = [];

  function visit(tbl: string) {
    if (visited.has(tbl) || visiting.has(tbl)) return;
    visiting.add(tbl);
    for (const parent of deps.get(tbl) || []) {
      visit(parent);
    }
    visiting.delete(tbl);
    visited.add(tbl);
    ordered.push(tbl);
  }

  for (const t of tables) visit(t);
  return ordered;
}

/**
 * Create a consistent, gzip-compressed PostgreSQL backup (.sql.gz) using pure Node.js streaming.
 */
export async function createDatabaseBackupFile(): Promise<{
  filename: string;
  filePath: string;
  sizeBytes: number;
  tableCount: number;
  rowCount: number;
}> {
  const cfg = getDatabaseConnectionConfig();
  if (!cfg) {
    throw new Error('Không tìm thấy biến môi trường DATABASE_URI để kết nối PostgreSQL.');
  }

  ensureBackupDirs();
  const filename = `backup_db_${formatVietnamTimestampForFile()}.sql.gz`;
  const finalPath = path.join(DB_BACKUP_DIR, filename);
  const tmpPath = `${finalPath}.tmp`;

  // Use a dedicated Client returning raw wire strings for lossless, zero-overhead export
  const client = new Client({
    ...cfg,
    types: {
      getTypeParser: (() => (val: string) => val) as any,
    },
  });

  const fileOut = fs.createWriteStream(tmpPath);
  const gzip = zlib.createGzip({ level: 6 });
  gzip.pipe(fileOut);

  const donePromise = new Promise<void>((resolve, reject) => {
    fileOut.on('finish', resolve);
    fileOut.on('error', reject);
    gzip.on('error', reject);
  });

  let totalRowsExported = 0;
  let tableCount = 0;

  try {
    await client.connect();
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');

    await writeChunk(
      gzip,
      `-- CDC Da Nang PostgreSQL Backup\n` +
        `-- Generated at: ${new Date().toISOString()}\n` +
        `SET client_encoding = 'UTF8';\n` +
        `SET standard_conforming_strings = on;\n` +
        `SET check_function_bodies = false;\n` +
        `BEGIN;\n` +
        `DO $$ BEGIN EXECUTE 'SET LOCAL session_replication_role = ''replica'''; EXCEPTION WHEN insufficient_privilege THEN null; END $$;\n\n`,
    );

    // 1. Export Enum Types
    const enumRes = await client.query<{ typname: string; labels: string }>(`
      SELECT t.typname,
             string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS labels
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    for (const row of enumRes.rows) {
      await writeChunk(
        gzip,
        `DO $$ BEGIN CREATE TYPE "public".${quoteIdent(row.typname)} AS ENUM (${row.labels}); EXCEPTION WHEN duplicate_object THEN null; END $$;\n`,
      );
    }
    if (enumRes.rows.length > 0) await writeChunk(gzip, '\n');

    // 2. Export Sequences
    const seqMetaRes = await client.query<{ sequencename: string; last_value: string | null }>(`
      SELECT sequencename, last_value::text AS last_value
      FROM pg_sequences
      WHERE schemaname = 'public'
      ORDER BY sequencename;
    `);
    for (const seq of seqMetaRes.rows) {
      await writeChunk(gzip, `CREATE SEQUENCE IF NOT EXISTS "public".${quoteIdent(seq.sequencename)};\n`);
    }
    if (seqMetaRes.rows.length > 0) await writeChunk(gzip, '\n');

    // 3. Query base tables and FK graph
    const tablesRes = await client.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    const allTables = tablesRes.rows.map((r) => r.tablename);
    tableCount = allTables.length;

    const fkRes = await client.query<{ child: string; parent: string; conname: string; def: string }>(`
      SELECT
        cl.relname AS child,
        ref_cl.relname AS parent,
        c.conname AS conname,
        pg_get_constraintdef(c.oid, true) AS def
      FROM pg_constraint c
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
      JOIN pg_class ref_cl ON ref_cl.oid = c.confrelid
      WHERE n.nspname = 'public' AND c.contype = 'f'
      ORDER BY cl.relname, c.conname;
    `);

    const orderedTables = topoSortTables(allTables, fkRes.rows);

    // 4. Emit CREATE TABLE IF NOT EXISTS DDL
    const colsByTable = new Map<string, string[]>();
    const selfFkTables = new Set<string>(
      fkRes.rows.filter((f) => f.child === f.parent).map((f) => f.child),
    );

    for (const tbl of orderedTables) {
      const colRes = await client.query<{
        attname: string;
        data_type: string;
        attnotnull: string;
        col_default: string | null;
      }>(
        `
        SELECT
          a.attname,
          pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
          a.attnotnull::text AS attnotnull,
          pg_get_expr(ad.adbin, ad.adrelid) AS col_default
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
        WHERE n.nspname = 'public'
          AND c.relname = $1
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY a.attnum;
        `,
        [tbl],
      );

      const conRes = await client.query<{ conname: string; def: string }>(
        `
        SELECT c.conname, pg_get_constraintdef(c.oid, true) AS def
        FROM pg_constraint c
        JOIN pg_class cl ON cl.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = cl.relnamespace
        WHERE n.nspname = 'public'
          AND cl.relname = $1
          AND c.contype IN ('p', 'u', 'c')
        ORDER BY c.contype, c.conname;
        `,
        [tbl],
      );

      const colNames = colRes.rows.map((c) => c.attname);
      colsByTable.set(tbl, colNames);

      const colLines = colRes.rows.map((c) => {
        let line = `  ${quoteIdent(c.attname)} ${c.data_type}`;
        if (c.col_default) line += ` DEFAULT ${c.col_default}`;
        if (c.attnotnull === 't') line += ' NOT NULL';
        return line;
      });

      const conLines = conRes.rows.map(
        (c) => `  CONSTRAINT ${quoteIdent(c.conname)} ${c.def}`,
      );

      await writeChunk(
        gzip,
        `CREATE TABLE IF NOT EXISTS "public".${quoteIdent(tbl)} (\n` +
          [...colLines, ...conLines].join(',\n') +
          `\n);\n`,
      );
    }

    // Emit FKs & Indexes idempotently
    await writeChunk(gzip, '\n');
    for (const fk of fkRes.rows) {
      await writeChunk(
        gzip,
        `DO $$ BEGIN ALTER TABLE "public".${quoteIdent(fk.child)} ADD CONSTRAINT ${quoteIdent(fk.conname)} ${fk.def}; EXCEPTION WHEN duplicate_object THEN null; END $$;\n`,
      );
    }

    const idxRes = await client.query<{ indexdef: string }>(`
      SELECT idx.indexdef
      FROM pg_indexes idx
      WHERE idx.schemaname = 'public'
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint con
          JOIN pg_class cl ON cl.oid = con.conrelid
          JOIN pg_namespace n ON n.oid = cl.relnamespace
          WHERE n.nspname = 'public'
            AND cl.relname = idx.tablename
            AND con.conname = idx.indexname
        )
      ORDER BY idx.tablename, idx.indexname;
    `);
    for (const idx of idxRes.rows) {
      const safeDef = idx.indexdef
        .replace(/^CREATE UNIQUE INDEX /i, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
        .replace(/^CREATE INDEX /i, 'CREATE INDEX IF NOT EXISTS ');
      await writeChunk(gzip, `${safeDef};\n`);
    }

    // 5. Truncate existing rows before inserting clean snapshot
    if (orderedTables.length > 0) {
      const tblList = orderedTables.map((t) => `"public".${quoteIdent(t)}`).join(', ');
      await writeChunk(gzip, `\nTRUNCATE TABLE ${tblList} RESTART IDENTITY CASCADE;\n\n`);
    }

    // 6. Stream table rows via PostgreSQL REPEATABLE READ cursor
    for (const tbl of orderedTables) {
      const colNames = colsByTable.get(tbl) || [];
      if (colNames.length === 0) continue;

      const selectCols = colNames.map((c) => `${quoteIdent(c)}::text AS ${quoteIdent(c)}`).join(', ');
      const orderClause =
        selfFkTables.has(tbl) && colNames.includes('parent_id')
          ? ' ORDER BY "parent_id" ASC NULLS FIRST, "id" ASC'
          : '';

      await client.query(`DECLARE bak_cur NO SCROLL CURSOR FOR SELECT ${selectCols} FROM "public".${quoteIdent(tbl)}${orderClause}`);

      const quotedColList = colNames.map(quoteIdent).join(', ');
      const insertPrefix = `INSERT INTO "public".${quoteIdent(tbl)} (${quotedColList}) VALUES\n`;
      let batchTuples: string[] = [];
      let batchCharSize = 0;
      let tableRows = 0;

      const flushBatch = async () => {
        if (batchTuples.length === 0) return;
        await writeChunk(gzip, `${insertPrefix}${batchTuples.join(',\n')};\n`);
        batchTuples = [];
        batchCharSize = 0;
      };

      try {
        while (true) {
          const fetchRes = await client.query(`FETCH 250 FROM bak_cur`);
          if (fetchRes.rows.length === 0) break;

          for (const row of fetchRes.rows) {
            const vals = colNames.map((col) => {
              const v = row[col];
              return v === null || v === undefined ? 'NULL' : quoteSqlLiteral(String(v));
            });
            const tuple = `(${vals.join(',')})`;
            batchTuples.push(tuple);
            batchCharSize += tuple.length;
            tableRows++;
            totalRowsExported++;

            if (batchTuples.length >= 100 || batchCharSize >= 262144) {
              await flushBatch();
            }
          }
        }
        await flushBatch();
      } finally {
        await client.query('CLOSE bak_cur');
      }

      if (tableRows > 0) {
        await writeChunk(gzip, `\n`);
      }
    }

    // 7. Restore sequence positions
    for (const seq of seqMetaRes.rows) {
      const seqState = await client.query<{ last_value: string | null; is_called: string }>(
        `SELECT last_value::text AS last_value, is_called::text AS is_called FROM "public".${quoteIdent(seq.sequencename)}`,
      );
      const sRow = seqState.rows[0];
      if (sRow) {
        const lastVal = sRow.last_value && Number(sRow.last_value) > 0 ? sRow.last_value : '1';
        const isCalled = sRow.last_value ? (sRow.is_called === 't' ? 'true' : 'false') : 'false';
        await writeChunk(
          gzip,
          `SELECT setval(${quoteSqlLiteral(`public.${quoteIdent(seq.sequencename)}`)}, ${lastVal}, ${isCalled});\n`,
        );
      }
    }

    await writeChunk(gzip, '\nCOMMIT;\n');
    await client.query('COMMIT');

    gzip.end();
    await donePromise;

    fs.renameSync(tmpPath, finalPath);
    const stat = fs.statSync(finalPath);

    return {
      filename,
      filePath: finalPath,
      sizeBytes: stat.size,
      tableCount,
      rowCount: totalRowsExported,
    };
  } catch (err) {
    gzip.destroy();
    fileOut.destroy();
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}
