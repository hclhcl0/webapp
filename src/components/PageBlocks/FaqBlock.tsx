'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Faq {
  id?: string;
  question: string;
  answer: string;
}

interface Props {
  title?: string;
  faqs: Faq[];
}

function FaqItem({ faq, index }: { faq: Faq; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${open ? 'shadow-sm' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          {faq.question}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-[var(--primary)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-5 pt-1 border-t border-gray-100 bg-gray-50/50">
          <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqBlock({ title, faqs }: Props) {
  if (!faqs?.length) return null;

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold text-[var(--primary)] mb-5">{title}</h3>
      )}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <FaqItem key={faq.id || i} faq={faq} index={i} />
        ))}
      </div>
    </div>
  );
}
