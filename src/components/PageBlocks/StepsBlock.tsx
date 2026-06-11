import React from 'react';

interface Step {
  id?: string;
  icon?: string;
  title: string;
  description?: string;
  note?: string;
}

interface Props {
  title?: string;
  layout?: 'vertical' | 'horizontal' | 'numbered';
  steps: Step[];
}

export function StepsBlock({ title, layout = 'vertical', steps }: Props) {
  if (!steps?.length) return null;

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold text-[var(--primary)] mb-6">{title}</h3>
      )}

      {layout === 'vertical' && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--primary)]/20" />
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.id || i} className="flex gap-5 relative">
                {/* Step circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg shadow-sm z-10">
                  {step.icon ? <span className="text-xl">{step.icon}</span> : i + 1}
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <h4 className="font-semibold text-gray-900 text-base mb-1 pt-2.5">{step.title}</h4>
                  {step.description && (
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  )}
                  {step.note && (
                    <span className="inline-block mt-2 text-xs text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-3 py-1">
                      💡 {step.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === 'horizontal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div key={step.id || i} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-sm">
                {step.icon ? <span className="text-2xl">{step.icon}</span> : i + 1}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
              {step.description && (
                <p className="text-gray-500 text-sm">{step.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {layout === 'numbered' && (
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.id || i} className="flex gap-5 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <span className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-2xl">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                {step.description && (
                  <p className="text-gray-500 text-sm">{step.description}</p>
                )}
                {step.note && (
                  <span className="inline-block mt-2 text-xs text-[var(--primary)] font-medium">
                    → {step.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
