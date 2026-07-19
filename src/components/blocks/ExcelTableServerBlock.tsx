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
    <div className="my-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm w-full max-w-full min-w-0">
      {(title || showDownload) && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border-b border-gray-200 gap-4">
          {title && <h3 className="font-bold text-lg text-gov-primary m-0">{title}</h3>}
          
          {showDownload && file.url && (
            <a 
              href={file.url} 
              download 
              target="_blank" 
              rel="noreferrer" 
              className="shrink-0 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải file ({file.filename.split('.').pop()?.toUpperCase()})
            </a>
          )}
        </div>
      )}

      {displayStyle === 'card' ? (
        <div className="p-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tableData.slice(hasHeader ? 1 : 0).map((row: any[], rowIndex: number) => {
              const cardTitle = row[0] || `Mục ${rowIndex + 1}`;
              const properties = row.slice(1);
              
              return (
                <div key={rowIndex} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                  <h4 className="font-bold text-lg text-gov-primary mb-3 pb-2 border-b border-gray-100">{cardTitle}</h4>
                  <ul className="space-y-2 text-sm">
                    {properties.map((cell: any, cellIndex: number) => {
                      const headerLabel = (hasHeader && tableData[0] && tableData[0][cellIndex + 1]) 
                        ? tableData[0][cellIndex + 1] 
                        : `Thông tin ${cellIndex + 1}`;
                      
                      if (cell === undefined || cell === null || cell === '') return null;
                      
                      return (
                        <li key={cellIndex} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-50 border-dashed last:border-0">
                          <span className="text-gray-500 font-medium">{headerLabel}:</span>
                          <span className="text-gray-900 font-semibold text-right">{cell}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {hasHeader && tableData.length > 0 && (
              <thead className="text-sm bg-blue-100 text-blue-900 shadow-sm">
                <tr>
                  {tableData[0].map((cell: any, idx: number) => (
                    <th key={idx} scope="col" className="px-4 py-3 font-bold border-b-2 border-blue-200">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            <tbody className="divide-y divide-gray-200">
              {tableData.slice(hasHeader ? 1 : 0).map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-blue-50/50 transition-colors bg-white">
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="px-3 py-2 text-gray-700 break-words">
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
