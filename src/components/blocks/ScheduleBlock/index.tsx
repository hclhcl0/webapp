import React from 'react';
import { Calendar, Syringe, Microscope, Hospital, Stethoscope, Clock, Ticket } from 'lucide-react';

interface ScheduleBlockProps {
  title: string;
  icon?: 'calendar' | 'syringe' | 'microscope' | 'hospital' | 'stethoscope';
  scheduleGroups: {
    groupTitle: string;
    timeSlots: {
      label: string;
      time: string;
    }[];
  }[];
  highlightBox?: {
    showHighlight?: boolean;
    title?: string;
    content?: { text: string }[];
  };
  bottomNote?: string;
}

const iconMap = {
  calendar: Calendar,
  syringe: Syringe,
  microscope: Microscope,
  hospital: Hospital,
  stethoscope: Stethoscope,
};

export const ScheduleBlock: React.FC<ScheduleBlockProps> = ({
  title,
  icon = 'calendar',
  scheduleGroups,
  highlightBox,
  bottomNote,
}) => {
  const IconComponent = iconMap[icon] || Calendar;

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden relative">
        {/* Header (Màu Gradient) */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-blue-500 p-6 flex flex-col items-center justify-center text-white relative overflow-hidden">
          {/* Subtle pattern or shape for background */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <IconComponent className="w-12 h-12 mb-3 relative z-10" strokeWidth={1.5} />
          <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight relative z-10 uppercase">
            {title}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Schedule Groups */}
          {scheduleGroups?.length > 0 && (
            <div className={`grid gap-6 ${scheduleGroups.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {scheduleGroups.map((group, i) => (
                <div key={i} className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[var(--primary)] rounded-full"></span>
                    {group.groupTitle}
                  </h3>
                  <div className="space-y-3">
                    {group.timeSlots?.map((slot, j) => (
                      <div key={j} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{slot.label}</p>
                          <p className="text-lg font-bold text-gray-900">{slot.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Highlight Box (Lấy số thứ tự) */}
          {highlightBox?.showHighlight && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/60 p-5 rounded-2xl relative overflow-hidden mt-6">
              <div className="absolute -right-4 -top-4 text-orange-500/10 rotate-12">
                <Ticket className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-3">
                  <Ticket className="w-5 h-5" />
                  {highlightBox.title || 'Lưu ý:'}
                </h4>
                <ul className="space-y-2">
                  {highlightBox.content?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-orange-900/80 font-medium">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Bottom Note */}
          {bottomNote && (
            <div className="text-center text-sm text-gray-500 italic mt-6 border-t border-gray-100 pt-4">
              {bottomNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
