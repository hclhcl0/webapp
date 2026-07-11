import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, HeartPulse, Tag, Phone, ShieldCheck, ShoppingCart } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getService(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });

    let query = {};
    if (slug.match(/^[0-9a-fA-F]{24}$/) || !isNaN(Number(slug))) {
      query = { id: { equals: slug } };
    } else {
      query = { slug: { equals: slug } };
    }

    const { docs } = await payload.find({
      collection: 'services',
      where: query,
      limit: 1,
    });

    return docs[0] || null;
  } catch (err) {
    console.error('Failed to fetch service:', err);
    return null;
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const thumbObj = service.thumbnail as any;
  const thumbUrl = thumbObj?.url || null;

  const renderRichText = (content: any) => {
    if (!content) return null;

    if (typeof content === 'object' && content.root && content.root.children) {
      return (
        <div className="prose prose-base max-w-none break-words prose-p:!my-1.5 prose-headings:!my-3 prose-ul:!my-1 prose-li:!my-0.5 prose-headings:text-gov-primary prose-a:text-gov-primary prose-img:rounded-lg">
          {content.root.children.map((block: any, i: number) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j} className={
                      [
                        textNode.format & 1 ? 'font-bold text-gray-900' : '',
                        textNode.format & 2 ? 'italic' : '',
                        textNode.format & 8 ? 'underline' : '',
                      ].filter(Boolean).join(' ')
                    }>
                      {textNode.text}
                    </span>
                  ))}
                </p>
              );
            }
            if (block.type === 'heading') {
              const Tag = `h${block.tag}` as any;
              return (
                <Tag key={i} className="font-bold text-gov-primary mt-6 mb-3">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j}>{textNode.text}</span>
                  ))}
                </Tag>
              );
            }
            if (block.type === 'list') {
              const ListTag = block.listType === 'bullet' ? 'ul' : 'ol';
              return (
                <ListTag key={i} className={`mb-4 pl-5 space-y-1 ${block.listType === 'bullet' ? 'list-disc marker:text-gov-primary' : 'list-decimal marker:text-gov-primary marker:font-bold'}`}>
                  {block.children?.map((item: any, j: number) => (
                    <li key={j} className="pl-1 text-gray-700">
                      {item.children?.map((textNode: any, k: number) => (
                        <span key={k} className={textNode.format & 1 ? 'font-bold' : ''}>{textNode.text}</span>
                      ))}
                    </li>
                  ))}
                </ListTag>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return <div className="text-gray-700">{JSON.stringify(content)}</div>;
  };

  const isActive = service.status === 'active';

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl py-3">
          <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-1.5">
            <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <Link href="/dich-vu" className="hover:text-gov-primary transition-colors">Dịch vụ - Sản phẩm</Link>
            {service.category && typeof service.category === 'object' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                <span className="text-gray-400">{service.category.name}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="text-gray-700 font-medium line-clamp-1">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-6">

        {/* Nút quay lại */}
        <Link
          href="/dich-vu"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gov-primary transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CỘT TRÁI — nội dung chính */}
          <div className="lg:col-span-2 space-y-5">

            {/* Ảnh + tiêu đề */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {thumbUrl && (
                <div className="relative aspect-[16/7] bg-gray-100 overflow-hidden">
                  <img
                    src={thumbUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {!isActive && (
                    <div className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                      TẠM NGƯNG
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {service.category && typeof service.category === 'object' && (
                  <span className="inline-block text-[11px] font-bold text-gov-primary uppercase tracking-wider bg-[var(--primary-50)] px-2.5 py-1 rounded mb-3">
                    {service.category.name}
                  </span>
                )}
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-3">
                  {service.title}
                </h1>
                {service.shortDescription && (
                  <p className="text-gray-500 text-sm leading-relaxed border-l-4 border-[var(--primary-100)] pl-4">
                    {service.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Nội dung chi tiết */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                <ShieldCheck className="w-5 h-5 text-gov-primary" />
                Thông tin chi tiết dịch vụ
              </h2>
              {service.content ? (
                renderRichText(service.content)
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Thông tin chi tiết đang được cập nhật.
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI — sidebar thông tin & CTA */}
          <div className="space-y-4">

            {/* Box giá + CTA */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-4">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  Mức phí / Giá niêm yết
                </div>
                <div className="text-2xl font-extrabold text-rose-600">
                  {service.price || 'Liên hệ để biết giá'}
                </div>
              </div>

              <div className="space-y-3">
                {service.bookingUrl && (
                  <a
                    href={service.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center items-center gap-2 py-3 px-5 bg-gov-primary hover:bg-gov-primary-dark text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Đăng ký trực tuyến
                  </a>
                )}

                {service.contactPhone && (
                  <a
                    href={`tel:${service.contactPhone.replace(/\D/g, '')}`}
                    className={`w-full flex justify-center items-center gap-2 py-3 px-5 rounded-lg font-bold text-sm transition-colors ${
                      service.bookingUrl
                        ? 'bg-white border border-gov-primary text-gov-primary hover:bg-[var(--primary-50)]'
                        : 'bg-gov-primary hover:bg-gov-primary-dark text-white shadow-sm'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    {service.contactPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Box thông tin nhanh */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Thông tin nhanh</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gov-primary shrink-0"></span>
                  <span>
                    Trạng thái: <strong className={isActive ? 'text-green-600' : 'text-rose-500'}>
                      {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </strong>
                  </span>
                </li>
                {service.category && typeof service.category === 'object' && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gov-primary shrink-0"></span>
                    <span>Danh mục: <strong>{service.category.name}</strong></span>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
