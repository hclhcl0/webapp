import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Check if URL has secret key to prevent unauthorized access
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== 'vnos-cdc-seed') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const csvPath = path.join(process.cwd(), 'public', 'banggia_vacxin.csv');
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'File CSV not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    lines.shift(); // Remove header

    let count = 0;
    for (const line of lines) {
      const row = [];
      const matches = [...line.matchAll(/"(.*?)"/g)];
      for(let match of matches) {
        row.push(match[1]);
      }
      
      if (row.length < 9) continue;
      
      const disease = row[1];
      let name = row[2];
      if (row[5] && row[5].trim() !== '') {
          name += ` (${row[5]})`;
      }
      const origin = row[3];
      const status = row[4] === 'Còn' ? 'in_stock' : 'out_of_stock';
      const price = parseInt(row[7].replace(/[,.]/g, '')) || 0;
      
      let notes = row[9] || '';
      const price2Str = row[8] ? row[8].trim() : '';
      if (price2Str && price2Str !== '' && price2Str !== '-' && price2Str !== row[7]) {
          notes = `Giá mũi 2+: ${price2Str} VNĐ. ` + notes;
      }
      
      // Upsert logic (Check if name exists)
      const existing = await payload.find({
        collection: 'vaccines',
        where: { name: { equals: name } },
        limit: 1,
      });

      if (existing.totalDocs > 0) {
        // Update
        await payload.update({
          collection: 'vaccines',
          id: existing.docs[0].id,
          data: {
            disease,
            origin,
            status,
            price,
            notes,
          }
        });
      } else {
        // Create
        await payload.create({
          collection: 'vaccines',
          data: {
            name,
            disease,
            origin,
            status,
            price,
            notes,
          }
        });
      }
      count++;
    }

    return NextResponse.json({ success: true, message: `Seeded ${count} vaccines successfully!` });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
