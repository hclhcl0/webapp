// @ts-nocheck
'use client';
import React, { useState } from 'react';
import {
  ChevronDown, Phone, Mail, Users, Building2,
  Stethoscope, Shield, FlaskConical, Search, X
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const UNIT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  ban_lanh_dao: { label: 'Ban Giám đốc', icon: <Shield size={15} /> },
  phong:        { label: 'Phòng chức năng', icon: <Building2 size={15} /> },
  khoa:         { label: 'Khoa chuyên môn', icon: <Stethoscope size={15} /> },
  khac:         { label: 'Đơn vị khác', icon: <FlaskConical size={15} /> },
};

const POSITION_LABEL: Record<string, string> = {
  giam_doc:    'Giám đốc',
  pho_giam_doc:'Phó Giám đốc',
  truong:      'Trưởng khoa/phòng',
  pho_truong:  'Phó Trưởng',
  bac_si:      'Bác sĩ',
  y_si:        'Y sĩ',
  dieu_duong:  'Điều dưỡng',
  ky_thuat_vien:'KTV',
  duoc_si:     'Dược sĩ',
  can_bo:      'Chuyên viên',
  nhan_vien:   'Nhân viên',
};

const ACADEMIC_LABEL: Record<string, string> = {
  gs: 'GS.', pgs: 'PGS.', ts: 'TS.', ths: 'ThS.',
  bsckii: 'BSCKII.', bscki: 'BSCKI.', bs: 'BS.',
  dsdh: 'DSĐH.', cn: 'CN.',
};

const PRIMARY = '#007a8c';
const PRIMARY_DARK = '#005f6d';
const PRIMARY_LIGHT = '#e6f4f6';

// ─── MemberCard ──────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: any }) {
  const avatarUrl = typeof member.avatar === 'object' ? member.avatar?.url : null;
  const prefix = ACADEMIC_LABEL[member.academicTitle] || '';
  const fullName = prefix ? `${prefix} ${member.memberName}` : member.memberName;
  const isLeader = ['giam_doc', 'pho_giam_doc', 'truong'].includes(member.position);

  return (
    <div
      className="flex flex-col items-center text-center gap-2 p-3"
      style={{ minWidth: 90, maxWidth: 110 }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2"
        style={{ borderColor: isLeader ? PRIMARY : '#e2e8f0' }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={member.memberName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
            style={{ background: isLeader ? PRIMARY : '#94a3b8' }}
          >
            {member.memberName.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <p className="text-xs font-semibold text-gray-800 leading-snug">{fullName}</p>
        <p className="text-[11px] mt-0.5 font-medium" style={{ color: PRIMARY }}>
          {POSITION_LABEL[member.position] || member.position}
        </p>
      </div>
    </div>
  );
}

// ─── AccordionRow ─────────────────────────────────────────────────────────────

function AccordionRow({ unit, index }: { unit: any; index: number }) {
  const [open, setOpen] = useState(unit.unitType === 'ban_lanh_dao');
  const cfg = UNIT_TYPE_CONFIG[unit.unitType] || UNIT_TYPE_CONFIG.khac;
  const members = unit.members || [];
  const isEven = index % 2 === 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Row header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none"
        style={{ background: open ? PRIMARY_LIGHT : (isEven ? '#fff' : '#fafafa') }}
        aria-expanded={open}
      >
        {/* Icon */}
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: open ? PRIMARY : '#f1f5f9',
            color: open ? '#fff' : PRIMARY,
          }}
        >
          {cfg.icon}
        </span>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{unit.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{cfg.label}</p>
        </div>

        {/* Staff count */}
        <span
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{
            background: open ? PRIMARY : '#f1f5f9',
            color: open ? '#fff' : '#64748b',
          }}
        >
          <Users size={11} />
          {members.length}
        </span>

        {/* Chevron */}
        <span
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            color: open ? PRIMARY : '#94a3b8',
          }}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t px-5 py-5" style={{ borderColor: PRIMARY + '22', background: '#fff' }}>
          {/* Description */}
          {unit.shortDescription && (
            <p className="text-sm text-gray-500 mb-4 italic">{unit.shortDescription}</p>
          )}

          {/* Contact */}
          {(unit.phone || unit.email) && (
            <div className="flex flex-wrap gap-4 mb-5">
              {unit.phone && (
                <a
                  href={`tel:${unit.phone}`}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                  style={{ color: PRIMARY }}
                >
                  <Phone size={12} /> {unit.phone}
                </a>
              )}
              {unit.email && (
                <a
                  href={`mailto:${unit.email}`}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
                  style={{ color: PRIMARY }}
                >
                  <Mail size={12} /> {unit.email}
                </a>
              )}
            </div>
          )}

          {/* Members */}
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">Chưa có thông tin nhân sự.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((mem: any, i: number) => (
                <MemberCard key={mem.id || i} member={mem} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OrgLandingPage({ units }: { units: any[] }) {
  const [search, setSearch] = useState('');

  const filtered = units.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.members?.some((m: any) => m.memberName.toLowerCase().includes(q))
    );
  });

  // Group by type for ordered display
  const TYPES_ORDER = ['ban_lanh_dao', 'phong', 'khoa', 'khac'];
  const groups = TYPES_ORDER.map(type => ({
    type,
    cfg: UNIT_TYPE_CONFIG[type] || UNIT_TYPE_CONFIG.khac,
    items: filtered.filter(u => u.unitType === type),
  })).filter(g => g.items.length > 0);

  const totalStaff = units.reduce((s, u) => s + (u.members?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Banner ─────────────────────────────────── */}
      <div style={{ background: PRIMARY }}>
        <div className="container mx-auto px-4 py-10 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-5">
            <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
            <span>›</span>
            <a href="/gioi-thieu" className="hover:text-white transition-colors">Giới thiệu</a>
            <span>›</span>
            <span className="text-white font-semibold">Cơ cấu tổ chức</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Cơ cấu Tổ chức
          </h1>
          <p className="text-white/70 text-sm mb-7">
            Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Đơn vị', value: units.length },
              { label: 'Nhân sự', value: totalStaff },
              { label: 'Phòng chức năng', value: units.filter(u => u.unitType === 'phong').length },
              { label: 'Khoa chuyên môn', value: units.filter(u => u.unitType === 'khoa').length },
            ].map(s => (
              <div
                key={s.label}
                className="bg-white/15 rounded-xl px-4 py-2.5 text-center"
                style={{ minWidth: 80 }}
              >
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-[11px] text-white/70 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm phòng/khoa, tên nhân sự..."
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:bg-white transition-colors"
              style={{
                focusBorderColor: PRIMARY,
              }}
              onFocus={e => (e.target.style.borderColor = PRIMARY)}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Accordion list ─────────────────────────── */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium">Không tìm thấy kết quả cho <strong>"{search}"</strong></p>
            <button onClick={() => setSearch('')} className="mt-3 text-sm underline" style={{ color: PRIMARY }}>
              Xoá tìm kiếm
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(group => (
              <section key={group.type}>
                {/* Group label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
                    {group.cfg.label}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{group.items.length} đơn vị</span>
                </div>

                {/* Accordion card */}
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  {group.items.map((unit, i) => (
                    <AccordionRow key={unit.id} unit={unit} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
