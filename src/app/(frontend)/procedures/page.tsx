import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Download, Clock, CreditCard, Search, Calendar, ChevronDown, List, Layers, ArrowRight } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getProceduresData(searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>) {
  try {
    const searchParams = await searchParamsPromise;
    const payload = await getPayload({ config: configPromise });
    
    // Fetch procedure groups
    const groupsData = await payload.find({
      collection: 'procedureGroups',
      sort: 'order',
      limit: 100,
    });
    
    const groups = groupsData.docs;
    
    // Parse filter
    const selectedGroupSlug = typeof searchParams.nhom === 'string' ? searchParams.nhom : null;
    let selectedGroupId = null;
    
    if (selectedGroupSlug) {
      const group = groups.find(g => g.slug === selectedGroupSlug);
      if (group) selectedGroupId = group.id;
    }

    // Build query for procedures
    const query: any = {
      status: { equals: 'active' }
    };
    
    if (selectedGroupId) {
      query.group = { equals: selectedGroupId };
    }

    // Fetch procedures
    const proceduresData = await payload.find({
      collection: 'procedures',
      where: query,
      sort: '-publishedDate',
      limit: 100,
    });
    
    return {
      groups,
      procedures: proceduresData.docs,
      selectedGroupSlug
    };
  } catch (err) {
    console.error('Failed to fetch procedures:', err);
    return { groups: [], procedures: [], selectedGroupSlug: null };
  }
}

export default async function ProceduresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { groups, procedures, selectedGroupSlug } = await getProceduresData(searchParams);

  const currentGroupName = selectedGroupSlug 
    ? groups.find(g => g.slug === selectedGroupSlug)?.name || 'Thủ tục hành chính'
    : 'Tất cả thủ tục hành chính';

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gov-primary to-gov-primary-dark text-white pt-6 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex items-center text-sm text-blue-100 mb-4 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-60" />
            <span className="text-white">Thủ tục hành chính</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-6 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                <Layers className="w-5 h-5 text-gov-primary mr-2.5" />
                <h2 className="font-bold text-gray-900 text-[15px] uppercase tracking-wide">Lĩnh vực giải quyết</h2>
              </div>
              <div className="p-3">
                <Link
                  href="/procedures"
                  className={`flex items-center px-3.5 py-2.5 text-[15px] rounded-xl mb-1 transition-all duration-200 ${
                    !selectedGroupSlug 
                      ? 'bg-gov-primary text-white shadow-md shadow-gov-primary/20 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gov-primary font-medium'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-3 ${!selectedGroupSlug ? 'bg-white' : 'bg-gray-300'}`}></div>
                  Tất cả lĩnh vực
                </Link>
                
                {groups.map((group) => {
                  const isActive = selectedGroupSlug === group.slug;
                  return (
                    <Link
                      key={group.id}
                      href={`/procedures?nhom=${group.slug}`}
                      className={`flex items-center px-3.5 py-2.5 text-[15px] rounded-xl mb-1 transition-all duration-200 ${
                        isActive 
                          ? 'bg-gov-primary text-white shadow-md shadow-gov-primary/20 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gov-primary font-medium'
                      }`}
                    >
                      {group.icon ? (
                        <span className="mr-3 text-[15px] w-4 text-center">{group.icon}</span>
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-white' : 'bg-gray-300'}`}></div>
                      )}
                      {group.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3 xl:w-3/4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-1.5 h-5 bg-gov-secondary rounded-full mr-3"></span>
                {currentGroupName}
              </h2>
              <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {procedures.length} thủ tục
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {procedures.map((proc: any) => {
                const fileObj = proc.file;
                const hasFile = !!fileObj || !!proc.driveUrl;
                
                let fileUrl = '#';
                if (proc.driveUrl) {
                  fileUrl = proc.driveUrl;
                } else if (fileObj) {
                  fileUrl = fileObj.url;
                }

                return (
                  <div key={proc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col sm:flex-row overflow-hidden">
                    <div className="p-4 flex-grow flex flex-col justify-center">
                      <div className="flex items-start mb-2">
                        <div className="bg-gov-primary/10 text-gov-primary p-2 rounded-xl mr-3 group-hover:bg-gov-primary group-hover:text-white transition-colors shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <Link href={`/procedures/${proc.slug || proc.id}`}>
                            <h3 className="font-bold text-base text-gray-900 leading-snug group-hover:text-gov-primary transition-colors line-clamp-2 mb-1.5">
                              {proc.title}
                            </h3>
                          </Link>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
                            {proc.group && typeof proc.group === 'object' && (
                              <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                                {proc.group.name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                              {new Date(proc.publishedDate).toLocaleDateString('vi-VN')}
                            </span>
                            {proc.implementationTime && (
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 opacity-70 text-amber-600" />
                                <span className="text-amber-700">{proc.implementationTime}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50/80 sm:w-40 p-4 flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 shrink-0">
                      <Link 
                        href={`/procedures/${proc.slug || proc.id}`}
                        className="flex-1 flex justify-center items-center py-2 px-3 bg-white border border-gray-200 text-gray-700 hover:border-gov-primary hover:text-gov-primary rounded-xl text-xs font-semibold transition-all duration-200 group-hover:shadow-sm"
                      >
                        Chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                      
                      {hasFile && (
                        <a 
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex justify-center items-center py-2 px-3 bg-gov-primary/10 text-gov-primary hover:bg-gov-primary hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 group-hover:shadow-sm"
                          title="Tải biểu mẫu"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Biểu mẫu
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {procedures.length === 0 && (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có dữ liệu</h3>
                <p className="text-gray-500 max-w-md mx-auto text-lg">
                  Hiện tại chưa có thủ tục hành chính nào trong mục này. Vui lòng chọn lĩnh vực khác.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
