export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import * as cheerio from 'cheerio';

// Seed từ backup (nội dung chuẩn), tải file qua backup.ksbtdanang.vn
const BASE_URL = 'https://backup.ksbtdanang.vn';
const SEED_SECRET = 'vnos-cdc-seed';

async function fetchPage(url: string): Promise<string> {
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return '';
}

function cleanTitle(rawText: string): string {
  return rawText
    .replace(/\s*\n\s*/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x3A;/g, ':')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseVietDate(ddmmyyyy: string): string | null {
  if (!ddmmyyyy) return null;
  const parts = ddmmyyyy.trim().split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function detectProcurementType(title: string, docNumber: string): string {
  const raw = (title + ' ' + docNumber).toLowerCase();
  const t = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (
    t.includes('ket qua') || t.includes('phe duyet ket qua') ||
    t.includes('kqlcnt') || t.includes('lua chon nha thau')
  ) return 'ket-qua-lua-chon';
  if (
    t.includes('moi chao gia') || t.includes('chao gia') ||
    t.includes('bao gia') || t.includes('tbcg') || t.includes('thu moi')
  ) return 'thu-moi-chao-gia';
  if (t.includes('moi thau') || t.includes('dau thau')) return 'moi-thau';
  if (t.includes('bao cao')) return 'bao-cao';
  if (t.includes('thong bao') || t.includes('thong tin')) return 'thong-bao';
  return 'khac';
}

function detectStatus(
  procType: string,
  publishedIso: string | null,
  deadlineIso: string | null
): string {
  if (procType === 'ket-qua-lua-chon') return 'evaluated';
  if (deadlineIso) return new Date(deadlineIso) >= new Date() ? 'open' : 'closed';
  if (publishedIso) {
    const days = (Date.now() - new Date(publishedIso).getTime()) / 86400000;
    return days <= 30 ? 'open' : 'closed';
  }
  return 'closed';
}

interface LawListItem {
  stt: number;
  docNumber: string;
  pubDateRaw: string;
  titleRaw: string;
  detailPath: string;
  fileUrls: Array<{ url: string; filename: string }>;
}

function parseLawsPage(html: string): LawListItem[] {
  const $ = cheerio.load(html);
  const items: LawListItem[] = [];

  $('table.table-striped tr').each((i, el) => {
    if (i === 0) return;
    const tds = $(el).find('td');
    if (tds.length < 4) return;

    const stt = parseInt($(tds[0]).text().trim(), 10) || i;
    const docNumEl = $(tds[1]).find('a').first();
    const docNumber = docNumEl.text().trim()
      .replace(/&#x002F;/g, '/')
      .replace(/&amp;/g, '&');
    const detailHref = docNumEl.attr('href') || $(tds[3]).find('a').first().attr('href') || '';
    const detailPath = detailHref.startsWith('http')
      ? detailHref.replace(BASE_URL, '')
      : detailHref;
    const pubDateRaw = $(tds[2]).text().trim();
    const titleEl = $(tds[3]).find('a').first();
    const titleRaw = cleanTitle(titleEl.text() || $(tds[3]).text());

    const fileUrls: Array<{ url: string; filename: string }> = [];
    if (tds[4]) {
      $(tds[4]).find('a').each((_, a) => {
        const href = $(a).attr('href');
        if (!href) return;
        const absUrl = href.startsWith('http') ? href : BASE_URL + href;
        const filename = $(a).attr('title') || $(a).text().trim() || 'file';
        fileUrls.push({ url: absUrl, filename });
      });
    }

    if (titleRaw && detailPath) {
      items.push({ stt, docNumber, pubDateRaw, titleRaw, detailPath, fileUrls });
    }
  });

  return items;
}

function parseDetailPage(html: string): { deadlineRaw: string | null; signer: string | null } {
  const $ = cheerio.load(html);
  let deadlineRaw: string | null = null;
  let signer: string | null = null;

  $('table').first().find('tr').each((_, tr) => {
    const label = $(tr).find('td').eq(0).text().trim().toLowerCase();
    const value = $(tr).find('td').eq(1).text().trim();
    if (
      label.includes('hi') && label.includes('u l') ||
      label.includes('b') && label.includes('t d') ||
      label.includes('hieu luc') || label.includes('bat dau')
    ) {
      deadlineRaw = value;
    } else if (label.includes('ng') && label.includes('i k') || label.includes('nguoi ky')) {
      signer = value;
    }
  });

  return { deadlineRaw, signer };
}

async function downloadFileToCms(
  payload: any,
  fileUrl: string,
  filename: string
): Promise<number | null> {
  try {
    const safeFilename = (filename || 'file.pdf')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/^[_\-]+/, '')
      || 'attachment.pdf';

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: safeFilename } },
      limit: 1,
    });
    if (existing.totalDocs > 0) return existing.docs[0].id;

    const res = await fetch(fileUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'application/pdf';
    const allowed = ['application/pdf', 'application/msword', 'application/vnd', 'application/zip'];
    if (!allowed.some(t => contentType.includes(t))) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0) return null;

    const doc = await payload.create({
      collection: 'media',
      data: { alt: safeFilename },
      file: { data: buffer, mimetype: contentType, name: safeFilename, size: buffer.byteLength },
    });
    return doc.id;
  } catch (err) {
    console.error('[seed-procurements] Loi tai file:', fileUrl, err);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const allPages = searchParams.get('all') === 'true';
  const pagesParam = searchParams.get('pages');
  const pageParam = searchParams.get('page');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const downloadMedia = searchParams.get('downloadMedia') === 'true';
  const fetchDetail = searchParams.get('fetchDetail') !== 'false';

  if (secret !== SEED_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. Them ?secret=vnos-cdc-seed' },
      { status: 401 }
    );
  }

  const payload = await getPayload({ config: configPromise });
  let pagesToFetch: number[] = [];

  if (allPages) {
    try {
      const page1Html = await fetchPage(BASE_URL + '/laws/');
      const $p = cheerio.load(page1Html);
      let maxPage = 1;
      $p('.pagination a').each((_, a) => {
        const m = ($p(a).attr('href') || '').match(/page-(\d+)/);
        if (m) maxPage = Math.max(maxPage, parseInt(m[1], 10));
      });
      for (let i = 1; i <= maxPage; i++) pagesToFetch.push(i);
    } catch {
      pagesToFetch = [1];
    }
  } else if (pagesParam) {
    const n = parseInt(pagesParam, 10);
    for (let i = 1; i <= (n || 1); i++) pagesToFetch.push(i);
  } else {
    const p = parseInt(pageParam || '1', 10);
    pagesToFetch = [isNaN(p) || p < 1 ? 1 : p];
  }

  const logs: string[] = [];
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  logs.push('Se cao ' + pagesToFetch.length + ' trang: [' + pagesToFetch.join(', ') + ']');

  for (const pageNum of pagesToFetch) {
    const listUrl = pageNum === 1
      ? BASE_URL + '/laws/'
      : BASE_URL + '/laws/page-' + pageNum + '/';

    logs.push('\nDang cao trang ' + pageNum + ': ' + listUrl);
    let listHtml: string;

    try {
      listHtml = await fetchPage(listUrl);
    } catch (err: any) {
      logs.push('Loi tai trang ' + pageNum + ': ' + err.message);
      totalErrors++;
      continue;
    }

    const items = parseLawsPage(listHtml);
    logs.push('Tim thay ' + items.length + ' muc.');

    for (const item of items) {
      try {
        const pubDateIso = parseVietDate(item.pubDateRaw);
        if (!pubDateIso) {
          totalSkipped++;
          continue;
        }

        const existingByDocNum = item.docNumber
          ? await payload.find({
              collection: 'procurements',
              where: { documentNumber: { equals: item.docNumber } },
              limit: 1,
            })
          : { totalDocs: 0, docs: [] as any[] };

        const existingByTitle =
          existingByDocNum.totalDocs === 0
            ? await payload.find({
                collection: 'procurements',
                where: { title: { equals: item.titleRaw } },
                limit: 1,
              })
            : { totalDocs: 0, docs: [] as any[] };

        const existingDoc = existingByDocNum.docs[0] || existingByTitle.docs[0];

        if (existingDoc && !forceUpdate) {
          logs.push('Bo qua (da ton tai): ' + item.docNumber);
          totalSkipped++;
          continue;
        }

        let deadlineIso: string | null = null;
        let signer: string | null = null;

        if (fetchDetail && item.detailPath) {
          try {
            const detailHtml = await fetchPage(BASE_URL + item.detailPath);
            const detail = parseDetailPage(detailHtml);
            if (detail.deadlineRaw) deadlineIso = parseVietDate(detail.deadlineRaw);
            if (detail.signer) signer = detail.signer;
          } catch {
            // ignore detail errors
          }
          await new Promise(r => setTimeout(r, 250));
        }

        const procType = detectProcurementType(item.titleRaw, item.docNumber);
        const status = detectStatus(procType, pubDateIso, deadlineIso);

        const firstFile = item.fileUrls[0];
        let fileId: number | null = null;
        let driveUrlVal: string | null = firstFile?.url || null;

        if (downloadMedia && firstFile) {
          fileId = await downloadFileToCms(payload, firstFile.url, firstFile.filename);
          if (fileId) driveUrlVal = null;
        }

        const noteParts: string[] = [];
        if (signer) noteParts.push('Nguoi ky: ' + signer);
        noteParts.push('Nguon: ' + BASE_URL + item.detailPath);
        if (item.fileUrls.length > 1) {
          noteParts.push('Co ' + item.fileUrls.length + ' file dinh kem');
        }

        const procData: Record<string, any> = {
          title: item.titleRaw,
          ...(item.docNumber ? { documentNumber: item.docNumber } : {}),
          procurementType: procType,
          status,
          publishedDate: pubDateIso,
          ...(deadlineIso ? { deadline: deadlineIso } : {}),
          ...(driveUrlVal ? { driveUrl: driveUrlVal } : {}),
          ...(fileId ? { file: fileId } : {}),
          note: noteParts.join(' | '),
        };

        if (existingDoc && forceUpdate) {
          await payload.update({
            collection: 'procurements',
            id: existingDoc.id,
            data: procData,
          });
          logs.push('Cap nhat: ' + item.docNumber + ' - ' + item.titleRaw.slice(0, 55));
          totalUpdated++;
        } else {
          await payload.create({ collection: 'procurements', data: procData });
          logs.push('Tao moi: ' + item.docNumber + ' - ' + item.titleRaw.slice(0, 55));
          totalCreated++;
        }

        await new Promise(r => setTimeout(r, 150));
      } catch (err: any) {
        logs.push('Loi: "' + item.titleRaw?.slice(0, 50) + '" - ' + err.message);
        totalErrors++;
      }
    }
  }

  const summary = {
    pages_fetched: pagesToFetch.length,
    created: totalCreated,
    updated: totalUpdated,
    skipped: totalSkipped,
    errors: totalErrors,
    total_processed: totalCreated + totalUpdated + totalSkipped + totalErrors,
  };

  logs.unshift(
    'KET QUA: Tao moi: ' + totalCreated +
    ', Cap nhat: ' + totalUpdated +
    ', Bo qua: ' + totalSkipped +
    ', Loi: ' + totalErrors
  );

  return NextResponse.json({ success: true, summary, logs });
}
