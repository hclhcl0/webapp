import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    // Ensure theme_settings table exists manually since we turned off push: true in production
    await payload.db.drizzle.execute(`
      CREATE TABLE IF NOT EXISTS "theme_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "org_colors_ban_lanh_dao" varchar,
        "org_colors_phong" varchar,
        "org_colors_khoa" varchar,
        "org_colors_khac" varchar,
        "updated_at" timestamp(3) with time zone,
        "created_at" timestamp(3) with time zone
      );
    `);

    return NextResponse.json({
      success: true,
      message: "theme_settings table checked/created successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
