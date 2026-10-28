import React from "react";
import { CdcMediaUI, type CdcMediaItem, type CdcMediaCategory } from "@/components/CdcMedia/CdcMediaUI";

interface Props {
  title?: string;
  subtitle?: string;
  defaultLayout?: "grid" | "list";
  limit?: number;
  showStats?: boolean;
  allowLayoutSwitch?: boolean;
  apiUrl?: string;
}

interface CachedMediaData {
  items: CdcMediaItem[];
  categories: CdcMediaCategory[];
  totalFiles: number;
  totalDownloads: number;
  totalSize: number;
  fetchedAt: number;
}

let mediaCache: CachedMediaData | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

async function fetchCdcMediaData(baseUrl: string): Promise<CachedMediaData | null> {
  const now = Date.now();
  if (mediaCache && now - mediaCache.fetchedAt < CACHE_TTL_MS) {
    return mediaCache;
  }

  try {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const [catsRes, mediaRes] = await Promise.all([
      fetch(`${cleanBase}/api/categories`, { next: { revalidate: 300 } }),
      fetch(`${cleanBase}/api/public/media?limit=500`, { next: { revalidate: 300 } }),
    ]);

    if (!mediaRes.ok) {
      return mediaCache;
    }

    const catsJson = catsRes.ok ? await catsRes.json() : { categories: [] };
    const mediaJson = await mediaRes.json();

    const rawCategories = Array.isArray(catsJson?.categories) ? catsJson.categories : [];
    const colorMap = new Map<string, string>();
    const categories: CdcMediaCategory[] = rawCategories.map((c: any) => {
      if (c.name && c.color) colorMap.set(c.name, c.color);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color || "#1D78B8",
        icon: c.icon || null,
        group: c.group || null,
        fileCount: c._count?.files ?? 0,
      };
    });

    const rawItems = Array.isArray(mediaJson?.items) ? mediaJson.items : [];
    let totalDownloads = 0;
    let totalSize = 0;

    const items: CdcMediaItem[] = rawItems.map((it: any) => {
      totalDownloads += Number(it.downloadCount || 0);
      totalSize += Number(it.fileSize || 0);
      return {
        id: it.id,
        title: it.title,
        description: it.description || "",
        category: it.category || "Truyền thông",
        categoryColor: colorMap.get(it.category) || "#1D78B8",
        group: it.group || "",
        mediaGroup: it.mediaGroup || "",
        typeLabel: it.typeLabel || "Tài liệu",
        fileType: it.fileType || "",
        filename: it.filename || "",
        tags: Array.isArray(it.tags) ? it.tags : [],
        detailUrl: it.detailUrl || `${cleanBase}/document/${it.id}`,
        previewUrl: it.previewUrl || `${cleanBase}/api/download/${it.id}?preview=true`,
        downloadUrl: it.downloadUrl || `${cleanBase}/api/download/${it.id}`,
        thumbnailUrl: it.thumbnailUrl || `${cleanBase}/api/thumbnail/${it.id}`,
        fileSize: Number(it.fileSize || 0),
        viewCount: Number(it.viewCount || 0),
        downloadCount: Number(it.downloadCount || 0),
        createdAt: it.createdAt || new Date().toISOString(),
      };
    });

    mediaCache = {
      items,
      categories,
      totalFiles: Number(mediaJson?.total || items.length),
      totalDownloads,
      totalSize,
      fetchedAt: now,
    };

    return mediaCache;
  } catch (err) {
    console.error("[CdcMediaSection] Error fetching from CDCMedia:", err);
    return mediaCache;
  }
}

export async function CdcMediaSection({
  title = "Ngân hàng Tài liệu Truyền thông",
  subtitle = "Kho lưu trữ tập trung tài liệu, hình ảnh, video và ấn phẩm phòng chống dịch bệnh CDC Đà Nẵng.",
  defaultLayout = "grid",
  limit = 8,
  showStats = true,
  allowLayoutSwitch = true,
  apiUrl = "https://media.ksbtdanang.vn",
}: Props) {
  const data = await fetchCdcMediaData(apiUrl);
  if (!data || data.items.length === 0) return null;

  return (
    <section className="w-full py-8 bg-slate-50/70 relative">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <CdcMediaUI
          title={title}
          subtitle={subtitle}
          items={data.items}
          categories={data.categories}
          totalFiles={data.totalFiles}
          totalDownloads={data.totalDownloads}
          totalSize={data.totalSize}
          defaultLayout={defaultLayout}
          limit={limit}
          showStats={showStats}
          allowLayoutSwitch={allowLayoutSwitch}
          baseUrl={apiUrl}
        />
      </div>
    </section>
  );
}
