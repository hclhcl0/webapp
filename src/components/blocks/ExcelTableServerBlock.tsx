import React from 'react';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export async function ExcelTableServerBlock({ title, file, sheetName, hasHeader, displayStyle = 'table', showDownload }: any) {
  if (!file || !file.filename) return null;

  let tableData: any[][] = [];
  try {
    const filePath = path.join(process.cwd(), 'media', file.filename);
    const buffer = await fs.promises.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Pick the specified sheet or the first one
    const sheetToRead = sheetName && workbook.SheetNames.includes(sheetName) 
      ? sheetName 
      : workbook.SheetNames[0];
      
    const sheet = workbook.Sheets[sheetToRead];
    // Convert sheet to a 2D array
    tableData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return (
      <div className="my-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
        Không thể đọc được file Excel. Vui lòng kiểm tra lại định dạng file.
      </div>
    );
  }

  if (!tableData || tableData.length === 0) return null;

  return (
    <div className="mt-2 mb-6 w-full max-w-full min-w-0 not-prose">
      {(title || showDownload) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          {title ? <h3 className="font-bold text-lg text-gov-primary m-0">{title}</h3> : <div></div>}
          
          {showDownload && file.url && (
            <a 
              href={file.url} 
              download 
              target="_blank" 
              rel="noreferrer" 
              title={`Tải file (${file.filename.split('.').pop()?.toUpperCase()})`}
              className="shrink-0 text-gray-400 hover:text-blue-600 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          )}
        </div>
      )}

      {displayStyle === 'card' ? (
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tableData.slice(hasHeader ? 1 : 0).map((row: any[], rowIndex: number) => {
              const cardTitle = row[0] || `Mục ${rowIndex + 1}`;
              const properties = row.slice(1);
              
              return (
                <div key={rowIndex} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col">
                  {/* Tiêu đề có nền */}
                  <div className="bg-blue-50 px-1 py-0.5 border-b border-blue-100 border-l-4 border-l-blue-600">
                    <h4 className="font-bold text-blue-900 line-clamp-2 leading-none" style={{ fontSize: '11px' }}>{cardTitle}</h4>
                  </div>
                  
                  {/* Khoảng cách các hàng rút gọn tối đa */}
                  <div className="px-1 py-1 flex-1">
                    <ul className="text-xs list-none !p-0 !m-0">
                      {properties.map((cell: any, cellIndex: number) => {
                        const headerStr = (hasHeader && tableData[0] && tableData[0][cellIndex + 1]) 
                          ? String(tableData[0][cellIndex + 1]) 
                          : `Thông tin ${cellIndex + 1}`;
                        
                        // Nếu trong file Excel cố tình viết in hoa toàn bộ, ép nó về chữ thường
                        const isAllCaps = headerStr === headerStr.toUpperCase() && headerStr.match(/[A-Z]/i) !== null;
                        const headerLabel = isAllCaps ? headerStr.toLowerCase() : headerStr;
                        
                        if (cell === undefined || cell === null || cell === '') return null;
                        
                        return (
                          <li key={cellIndex} className="flex justify-between items-start py-0.5 !px-0 !m-0 border-b border-gray-100 border-dashed last:border-0 gap-1.5">
                            <span className="text-gray-500 font-medium text-[11px] mt-0.5 shrink-0 capitalize">{headerLabel}</span>
                            <span className="text-gray-900 font-bold text-right">{cell}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-[11px] text-left">
            {hasHeader && tableData.length > 0 && (
              <thead className="bg-blue-100 text-blue-900 shadow-sm text-[11px]">
                <tr>
                  {tableData[0].map((cell: any, idx: number) => {
                    const headerStr = String(cell || '');
                    const isAllCaps = headerStr === headerStr.toUpperCase() && headerStr.match(/[A-Z]/i) !== null;
                    const headerLabel = isAllCaps ? headerStr.toLowerCase() : headerStr;
                    
                    return (
                      <th key={idx} scope="col" className="px-1.5 py-0.5 font-bold border-b-2 border-blue-200 border-r border-blue-200/50 last:border-r-0 whitespace-nowrap capitalize leading-none">
                        {headerLabel}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            
            <tbody className="divide-y divide-gray-200">
              {tableData.slice(hasHeader ? 1 : 0).map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-blue-50/50 transition-colors bg-white">
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="px-1.5 py-0 text-gray-700 break-words border-r border-gray-100 last:border-r-0 leading-tight">
                      {cell || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
