import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, Download, Clock, CreditCard, CheckCircle, FileCheck, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getProcedure(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Check if slug is an ID or actual slug
    let query = {};
    if (slug.match(/^[0-9a-fA-F]{24}$/) || !isNaN(Number(slug))) {
      query = { id: { equals: slug } };
    } else {
      query = { slug: { equals: slug } };
    }

    const { docs } = await payload.find({
      collection: 'procedures',
      where: query,
      limit: 1,
    });

    return docs[0] || null;
  } catch (err) {
    console.error('Failed to fetch procedure:', err);
    return null;
  }
}

export default async function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const procedure = await getProcedure(slug);

  if (!procedure) {
    notFound();
  }

  const fileObj = procedure.file as any;
  const hasFile = !!fileObj || !!procedure.driveUrl;
  
  let fileUrl = '#';
  if (procedure.driveUrl) {
    fileUrl = procedure.driveUrl;
  } else if (fileObj) {
    fileUrl = fileObj.url;
  }

  // Helper to render rich text or fallback to JSON stringify
  const renderRichText = (content: any) => {
    if (!content) return <p className="text-gray-500 italic">Không có thông tin</p>;
    
    // Basic rendering for Payload Lexical/Slate JSON structure
    if (typeof content === 'object' && content.root && content.root.children) {
      return (
        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
          {content.root.children.map((block: any, i: number) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="mb-4 text-[15px]">
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
            if (block.type === 'list') {
              const ListTag = block.listType === 'bullet' ? 'ul' : 'ol';
              return (
                <ListTag key={i} className={`mb-4 pl-6 space-y-2 text-[15px] ${block.listType === 'bullet' ? 'list-disc marker:text-gov-primary' : 'list-decimal marker:text-gov-primary marker:font-bold'}`}>
                  {block.children?.map((item: any, j: number) => (
                    <li key={j} className="pl-1">
                      {item.children?.map((textNode: any, k: number) => (
                        <span key={k} className={textNode.format & 1 ? 'font-bold' : ''}>{textNode.text}</span>
                      ))}
                    </li>
                  ))}
                </ListTag>
              )
            }
            return null;
          })}
        </div>
      );
    }
    
    return <div className="text-gray-700">{JSON.stringify(content)}</div>;
  };

  const isActive = procedure.status === 'active';

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-8 pb-4 max-w-5xl">


        <Link href="/procedures" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-gov-primary transition-colors mb-6 group">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gov-primary group-hover:bg-blue-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Quay lại danh sách
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Hero Banner Section */}
          <div className="bg-gradient-to-r from-gov-primary-dark via-gov-primary to-teal-500 text-white p-8 md:p-12 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl transform translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                {procedure.group && typeof procedure.group === 'object' && (
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-4 shadow-sm">
                    {procedure.group.name}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-balance">
                  {procedure.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-blue-50 text-sm font-medium">
                  <span className="flex items-center bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-4 h-4 mr-2 opacity-70" />
                    Ban hành: {new Date(procedure.publishedDate).toLocaleDateString('vi-VN')}
                  </span>
                  
                  <span className={`flex items-center px-3 py-1.5 rounded-lg backdrop-blur-sm font-bold border ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' 
                      : 'bg-rose-500/20 text-rose-100 border-rose-400/30'
                  }`}>
                    {isActive ? <CheckCircle className="w-4 h-4 mr-1.5" /> : null}
                    {isActive ? 'CÒN HIỆU LỰC' : 'HẾT HIỆU LỰC'}
                  </span>
                </div>
              </div>

              {hasFile && (
                <div className="hidden md:block shrink-0">
                  <a 
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-16 h-16 bg-white text-gov-primary rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                    title="Tải biểu mẫu đính kèm"
                  >
                    <Download className="w-7 h-7" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-gov-primary" />
              Thông tin quy trình
            </h2>

            {/* Information Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow">
                <div className="flex items-start">
                  <div className="bg-sky-50 text-sky-600 p-3 rounded-xl mr-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Thời gian thực hiện</h3>
                    <p className="text-gray-600 font-medium">
                      {procedure.implementationTime || <span className="italic text-gray-400 font-normal">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow">
                <div className="flex items-start">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mr-4">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phí, lệ phí</h3>
                    <p className="text-gray-600 font-medium">
                      {procedure.fee || <span className="italic text-gray-400 font-normal">Không có hoặc chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow md:col-span-2">
                <div className="flex items-start">
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-xl mr-4">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Kết quả giải quyết</h3>
                    <p className="text-gray-600 font-medium">
                      {procedure.result || <span className="italic text-gray-400 font-normal">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            {procedure.requirements && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-gov-primary" />
                  Yêu cầu / Điều kiện thực hiện
                </h2>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 md:p-8 rounded-2xl border border-amber-100/50">
                  {renderRichText(procedure.requirements)}
                </div>
              </div>
            )}

            {/* Download Action Section */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-10 text-center border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Biểu mẫu & Tài liệu đính kèm</h3>
              <p className="text-gray-500 mb-6">Tải về mẫu đơn, tờ khai để chuẩn bị hồ sơ hoàn chỉnh</p>
              
              {hasFile ? (
                <a 
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gov-primary hover:bg-gov-primary-dark text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-gov-primary/30 hover:shadow-xl hover:shadow-gov-primary/40 hover:-translate-y-1"
                >
                  <Download className="w-6 h-6 mr-3" />
                  Tải xuống biểu mẫu ngay
                </a>
              ) : (
                <div className="inline-flex items-center px-6 py-4 bg-white text-gray-400 rounded-xl font-medium border border-gray-200 border-dashed">
                  <FileText className="w-5 h-5 mr-3 opacity-50" />
                  Thủ tục này không có biểu mẫu đính kèm
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
