import React from 'react';

interface Cell {
  content: string;
  highlight?: boolean;
}

interface Row {
  cells: Cell[];
}

interface Header {
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface Props {
  title?: string;
  headers?: Header[];
  rows?: Row[];
  caption?: string;
  striped?: boolean;
  bordered?: boolean;
}

export function TableBlock({ title, headers, rows, caption, striped = true, bordered = true }: Props) {
  if (!headers?.length || !rows?.length) return null;

  return (
    <div className="my-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
      )}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
        <table className={`w-full text-sm ${bordered ? 'border-collapse' : ''}`}>
          <thead>
            <tr className="bg-[var(--primary)] text-white">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-semibold text-${h.align || 'left'} ${bordered ? 'border-r border-white/20 last:border-r-0' : ''}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`transition-colors ${striped && ri % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-[var(--primary)]/5`}
              >
                {row.cells?.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 text-gray-700 ${bordered ? 'border-r border-b border-gray-100 last:border-r-0' : 'border-b border-gray-100'} ${cell.highlight ? 'font-semibold text-[var(--primary)]' : ''}`}
                  >
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {caption && (
            <caption className="caption-bottom text-xs text-gray-400 text-center py-2 bg-gray-50">
              {caption}
            </caption>
          )}
        </table>
      </div>
    </div>
  );
}
