import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * Đếm số bài viết cho từng topic (bao gồm cả bài của các subtopic con).
 * Sau đó sắp xếp topics theo số bài giảm dần (nhiều nhất lên trên).
 *
 * @param topicsWithChildren - Danh sách topic đã gắn children
 * @returns Danh sách topics đã được sắp xếp theo article count
 */
export async function sortTopicsByArticleCount(topicsWithChildren: any[]): Promise<any[]> {
  if (topicsWithChildren.length === 0) return [];

  const payload = await getPayload({ config: configPromise });

  // Đếm bài viết cho từng topic song song (Promise.all)
  const counts = await Promise.all(
    topicsWithChildren.map(async (topic) => {
      const childIds = (topic.children || []).map((c: any) => c.id);
      const allIds = [topic.id, ...childIds];

      const { totalDocs } = await payload.find({
        collection: 'articles',
        where: {
          category: { in: allIds },
          _status: { equals: 'published' },
        },
        limit: 0, // chỉ cần đếm, không cần lấy data
      });

      return { ...topic, _articleCount: totalDocs };
    })
  );

  // Sắp xếp giảm dần theo số bài
  return counts.sort((a, b) => b._articleCount - a._articleCount);
}
