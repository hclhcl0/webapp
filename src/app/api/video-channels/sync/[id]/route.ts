import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID kênh' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const clientChannelId = body.channelId;

    const payload = await getPayload({ config: configPromise });

    // Lấy thông tin kênh
    const channel = await payload.findByID({
      collection: 'video-channels',
      id,
    });

    const activeChannelId = clientChannelId || channel?.channelId;

    if (!channel || channel.platform !== 'youtube' || !activeChannelId) {
      return NextResponse.json({ error: 'Kênh không hợp lệ hoặc thiếu Channel ID' }, { status: 400 });
    }

    // Lấy RSS Feed của YouTube
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${activeChannelId}`;
    const response = await fetch(rssUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Không thể lấy dữ liệu từ YouTube RSS (Kiểm tra lại Channel ID)' }, { status: 500 });
    }

    const xml = await response.text();

    // Dùng regex parse RSS (an toàn và cực nhanh đối với format chuẩn của YT)
    const entries: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entryContent = match[1];
      const videoIdMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
      const dateMatch = entryContent.match(/<published>(.*?)<\/published>/);
      const mediaGroupMatch = entryContent.match(/<media:group>([\s\S]*?)<\/media:group>/);
      
      let description = '';
      if (mediaGroupMatch) {
        const descMatch = mediaGroupMatch[1].match(/<media:description>([\s\S]*?)<\/media:description>/);
        if (descMatch) description = descMatch[1];
      }

      if (videoIdMatch && titleMatch) {
        entries.push({
          videoId: videoIdMatch[1],
          title: titleMatch[1].trim(),
          publishedDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
          description: description.substring(0, 500).trim(), // Giới hạn 500 ký tự
        });
      }
    }

    if (entries.length === 0) {
      return NextResponse.json({ newVideos: 0, message: 'Không tìm thấy video nào trong RSS feed.' });
    }

    // Kiểm tra xem video đã tồn tại trong DB chưa bằng cách tìm tất cả video của kênh này
    const existingVideosResult = await payload.find({
      collection: 'videos',
      where: { channel: { equals: channel.id } },
      limit: 100, // RSS của Youtube trả về tối đa 15 video, lấy 100 là dư sức check
    });

    const existingUrls = existingVideosResult.docs.map(doc => doc.videoUrl);
    let newCount = 0;

    // Duyệt từ cũ đến mới (đảo ngược mảng) để giữ đúng thứ tự ngày tháng khi insert (tùy chọn)
    for (const entry of entries.reverse()) {
      const videoUrl = `https://www.youtube.com/watch?v=${entry.videoId}`;
      
      // Nếu video chưa tồn tại, tạo mới
      if (!existingUrls.includes(videoUrl)) {
        await payload.create({
          collection: 'videos',
          data: {
            title: entry.title,
            platform: 'youtube',
            channel: channel.id,
            videoUrl: videoUrl,
            description: entry.description,
            publishedDate: entry.publishedDate,
          },
        });
        newCount++;
      }
    }

    return NextResponse.json({ success: true, newVideos: newCount });

  } catch (error: any) {
    console.error('Lỗi đồng bộ Youtube:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
