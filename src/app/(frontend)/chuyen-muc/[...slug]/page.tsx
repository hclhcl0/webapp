/**
 * /chuyen-muc/[...slug] → redirect 301 sang /[...slug]
 *
 * Giữ lại route này để tránh 404 cho các link cũ.
 * Mọi request đến /chuyen-muc/a/b/c sẽ được redirect sang /a/b/c
 */
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ChuyenMucRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  // /chuyen-muc/a/b → /a/b
  redirect(`/${slug.join('/')}`);
}
