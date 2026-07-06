// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Phone, Mail, Users, ChevronDown, ChevronUp, Building2,
  Award, Stethoscope, FlaskConical, Shield, Search, X
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const UNIT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; gradient: string; accent: string }> = {
  ban_lanh_dao: {
    label: 'Ban Giám đốc',
    icon: <Shield size={18} />,
    gradient: 'from-[#0f4c75] to-[#1b6ca8]',
    accent: '#0f4c75',
  },
  phong: {
    label: 'Phòng chức năng',
    icon: <Building2 size={18} />,
    gradient: 'from-[#007a8c] to-[#00a8c6]',
    accent: '#007a8c',
  },
  khoa: {
    label: 'Khoa chuyên môn',
    icon: <Stethoscope size={18} />,
    gradient: 'from-[#1a7a4a] to-[#2ecc71]',
    accent: '#1a7a4a',
  },
  khac: {
    label: 'Đơn vị khác',
    icon: <FlaskConical size={18} />,
    gradient: 'from-[#6d28d9] to-[#8b5cf6]',
    accent: '#6d28d9',
  },
};

const POSITION_LABEL: Record<string, string> = {
  giam_doc: 'Giám đốc',
  pho_giam_doc: 'Phó Giám đốc',
  truong: 'Trưởng khoa/phòng',
  pho_truong: 'Phó Trưởng khoa/phòng',
  bac_si: 'Bác sĩ',
  y_si: 'Y sĩ',
  dieu_duong: 'Điều dưỡng',
  ky_thuat_vien: 'Kỹ thuật viên',
  duoc_si: 'Dược sĩ',
  can_bo: 'Cán bộ/Chuyên viên',
  nhan_vien: 'Nhân viên',
};

const ACADEMIC_LABEL: Record<string, string> = {
  gs: 'GS.', pgs: 'PGS.', ts: 'TS.', ths: 'ThS.',
  bsckii: 'BSCKII.', bscki: 'BSCKI.', bs: 'BS.', dsdh: 'DSĐH.', cn: 'CN.',
};

// ─── MemberCard ──────────────────────────────────────────────────────────────

function MemberCard({ member, accent }: { member: any; accent: string }) {
  const avatarUrl = typeof member.avatar === 'object' ? member.avatar?.url : null;
  const prefix = ACADEMIC_LABEL[member.academicTitle] || '';
  const fullName = prefix ? `${prefix} ${member.memberName}` : member.memberName;
  const isLeader = ['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(member.position);

  return (
    <div className={`flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isLeader ? 'bg-white shadow-md border-2' : 'bg-gray-50/80 border border-gray-100'}`}
      style={{ borderColor: isLeader ? accent + '33' : undefined }}>
      {/* Avatar */}
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-white ring-2"
          style={{ ringColor: accent + '44' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={member.memberName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
              {member.memberName.charAt(0)}
            </div>
          )}
        </div>
        {isLeader && (
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: accent }}>
            <Award size={12} className="text-white" />
          </span>
        )}
      </div>

      {/* Info */}
      <p className="font-bold text-sm text-gray-900 leading-tight">{fullName}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: accent }}>{POSITION_LABEL[member.position] || member.position}</p>
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-[11px] text-gray-400 mt-1 hover:text-blue-500 truncate max-w-full">
          {member.email}
        </a>
      )}
    </div>
  );
}

// ─── UnitCard ────────────────────────────────────────────────────────────────

function UnitCard({ unit, defaultOpen = false }: { unit: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = UNIT_TYPE_CONFIG[unit.unitType] || UNIT_TYPE_CONFIG.khac;
  const members = unit.members || [];
  const leader = members.find(m => ['giam_doc', 'pho_giam_doc', 'truong'].includes(m.position));
  const rest = members.filter(m => m !== leader);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-md transition-all duration-300 group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-5 cursor-pointer select-none`}
        onClick={() => setOpen(v => !v)}
        role="button"
        aria-expanded={open}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 mt-0.5">
              {cfg.icon}
            </span>
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">{cfg.label}</p>
              <h3 className="text-base font-bold text-white leading-tight">{unit.name}</h3>
              {leader && (
                <p className="text-xs text-white/75 mt-1 flex items-center gap-1">
                  <Users size={11} />
                  {POSITION_LABEL[leader.position]}: {leader.memberName}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium">
              {members.length} người
            </span>
            <span className="text-white/80 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
              <ChevronDown size={18} />
            </span>
          </div>
        </div>

        {/* Contact row */}
        {(unit.phone || unit.email) && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/20">
            {unit.phone && (
              <a href={`tel:${unit.phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors">
                <Phone size={11} /> {unit.phone}
              </a>
            )}
            {unit.email && (
              <a href={`mailto:${unit.email}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors truncate">
                <Mail size={11} /> {unit.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Body – members */}
      {open && (
        <div className="p-4">
          {unit.shortDescription && (
            <p className="text-sm text-gray-500 mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              {unit.shortDescription}
            </p>
          )}
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có thông tin nhân sự</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {members.map((mem, i) => (
                <MemberCard key={mem.id || i} member={mem} accent={cfg.accent} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ───────────────────────────────────────────────────

export function OrgLandingPage({ units }: { units: any[] }) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string>('all');

  // Group stats
  const stats = {
    total: units.length,
    ban_lanh_dao: units.filter(u => u.unitType === 'ban_lanh_dao').length,
    phong: units.filter(u => u.unitType === 'phong').length,
    khoa: units.filter(u => u.unitType === 'khoa').length,
    totalStaff: units.reduce((acc, u) => acc + (u.members?.length || 0), 0),
  };

  const filtered = units.filter(u => {
    const matchType = activeType === 'all' || u.unitType === activeType;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) ||
      u.members?.some(m => m.memberName.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  // Group by type for ordered display
  const TYPES_ORDER = ['ban_lanh_dao', 'phong', 'khoa', 'khac'];
  const groups = TYPES_ORDER.map(type => ({
    type,
    items: filtered.filter(u => u.unitType === type),
  })).filter(g => g.items.length > 0);

  const filterTabs = [
    { key: 'all', label: 'Tất cả', count: units.length },
    { key: 'ban_lanh_dao', label: 'Ban Giám đốc', count: stats.ban_lanh_dao },
    { key: 'phong', label: 'Phòng chức năng', count: stats.phong },
    { key: 'khoa', label: 'Khoa chuyên môn', count: stats.khoa },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, #e8f5f5 40%, #f5f0ff 100%)' }}>

      {/* ─── Hero Banner ───────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f4c75 0%, #007a8c 50%, #1a7a4a 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 translate-x-1/3 -translate-y-1/3"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 -translate-x-1/3 translate-y-1/3"
            style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        </div>

        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
            <span>›</span>
            <a href="/gioi-thieu" className="hover:text-white transition-colors">Giới thiệu</a>
            <span>›</span>
            <span className="text-white font-medium">Cơ cấu tổ chức</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            Cơ cấu Tổ chức
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mb-10">
            Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng — gồm Ban Giám đốc, các phòng chức năng và khoa chuyên môn phục vụ công tác y tế dự phòng toàn thành phố.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tổng đơn vị', value: stats.total, icon: '🏛️' },
              { label: 'Ban Giám đốc', value: stats.ban_lanh_dao, icon: '⭐' },
              { label: 'Phòng chức năng', value: stats.phong, icon: '🗂️' },
              { label: 'Khoa chuyên môn', value: stats.khoa, icon: '🩺' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/65 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Filter + Search bar ────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                  activeType === tab.key
                    ? 'bg-[#007a8c] text-white border-[#007a8c] shadow-sm'
                    : 'text-gray-600 border-gray-200 hover:border-[#007a8c] hover:text-[#007a8c]'
                }`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeType === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm phòng, nhân sự..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-gray-200 bg-white focus:outline-none focus:border-[#007a8c] focus:ring-2 focus:ring-[#007a8c]/10 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy kết quả</p>
            <button onClick={() => { setSearch(''); setActiveType('all'); }}
              className="mt-4 text-sm text-[#007a8c] hover:underline font-medium">Xoá bộ lọc</button>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map(group => {
              const cfg = UNIT_TYPE_CONFIG[group.type] || UNIT_TYPE_CONFIG.khac;
              return (
                <section key={group.type}>
                  {/* Group heading */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ background: cfg.accent }}>
                      {cfg.icon}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{cfg.label}</h2>
                      <p className="text-sm text-gray-400">{group.items.length} đơn vị</p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4" />
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.items.map((unit, i) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        defaultOpen={group.type === 'ban_lanh_dao'}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Footer CTA ──────────────────────────────── */}
      <div className="mt-10 py-12" style={{ background: 'linear-gradient(135deg, #0f4c75, #007a8c)' }}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl md:text-2xl font-black text-white mb-3">Liên hệ với chúng tôi</h3>
          <p className="text-white/70 mb-6 text-sm">Trụ sở: Số 3 Quang Trung, Hải Châu, Đà Nẵng</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:02363822731"
              className="flex items-center gap-2 bg-white text-[#007a8c] font-bold px-6 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
              <Phone size={16} /> (0236) 3.822.731
            </a>
            <a href="mailto:info@cdcdanang.vn"
              className="flex items-center gap-2 bg-white/10 text-white font-bold px-6 py-3 rounded-full border border-white/30 hover:bg-white/20 transition-all text-sm">
              <Mail size={16} /> info@cdcdanang.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
