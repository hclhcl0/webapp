'use client';
import React, { useState } from 'react';

type Member = {
  id: string;
  memberName: string;
  position: string;
  academicTitle?: string;
  email?: string;
  avatar?: { url?: string; alt?: string };
};

type OrgUnit = {
  id: string;
  name: string;
  unitType: 'ban_lanh_dao' | 'phong' | 'khoa' | 'khac';
  order: number;
  shortDescription?: string;
  phone?: string;
  email?: string;
  image?: { url?: string };
  members?: Member[];
};

const POSITION_LABELS: Record<string, string> = {
  giam_doc: 'Giám đốc',
  pho_giam_doc: 'Phó Giám đốc',
  truong: 'Trưởng phòng/khoa',
  pho_truong: 'Phó Trưởng phòng/khoa',
  bac_si: 'Bác sĩ',
  y_si: 'Y sĩ',
  dieu_duong: 'Điều dưỡng',
  ky_thuat_vien: 'Kỹ thuật viên',
  duoc_si: 'Dược sĩ',
  can_bo: 'Cán bộ/Chuyên viên',
  nhan_vien: 'Nhân viên',
};

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ban_lanh_dao: { label: 'Ban Lãnh đạo', color: '#0ea5e9', bg: '#f0f9ff' },
  phong: { label: 'Phòng chức năng', color: '#10b981', bg: '#ecfdf5' },
  khoa: { label: 'Khoa chuyên môn', color: '#3b82f6', bg: '#eff6ff' },
  khac: { label: 'Đơn vị khác', color: '#f59e0b', bg: '#fffbeb' },
};

function UnitCard({ unit, themeColors }: { unit: OrgUnit; themeColors: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const typeInfo = TYPE_LABELS[unit.unitType] || TYPE_LABELS.khac;
  const color = themeColors[unit.unitType] || typeInfo.color;
  const leader = unit.members?.find(m => ['giam_doc', 'truong', 'pho_giam_doc'].includes(m.position));

  return (
    <div style={{
      borderRadius: '1.25rem',
      overflow: 'hidden',
      background: 'white',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.3s ease',
      height: 'fit-content'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 20px 25px -5px ${color}15, 0 8px 10px -6px ${color}10`;
      e.currentTarget.style.borderColor = `${color}30`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)';
      e.currentTarget.style.borderColor = '#f1f5f9';
    }}>
      {/* Card Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
        borderBottom: `2px solid ${color}20`,
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Leader avatar */}
          {leader?.avatar?.url ? (
            <img
              src={leader.avatar.url}
              alt={leader.memberName}
              style={{ width: 56, height: 56, borderRadius: '1rem', objectFit: 'cover', border: `2px solid white`, boxShadow: `0 4px 10px ${color}30`, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '1rem',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'white', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
              boxShadow: `0 4px 10px ${color}30`
            }}>
              {unit.name[0]}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-block',
              fontSize: '0.75rem', fontWeight: 700,
              color, background: `${color}15`,
              padding: '4px 10px', borderRadius: '20px',
              marginBottom: '0.5rem', letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              {typeInfo.label}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {unit.name}
            </h3>
            {leader && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {POSITION_LABELS[leader.position] || leader.position}: <strong style={{ color: '#334155' }}>{leader.memberName}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <div
        style={{
          width: '100%', padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc', border: 'none',
          fontSize: '0.875rem', color: '#64748b', fontWeight: 600,
          borderBottom: open ? '1px solid #f1f5f9' : 'none',
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {unit.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {unit.phone}
            </span>
          )}
          {unit.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              {unit.email}
            </span>
          )}
        </span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: color,
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600,
            padding: '4px 8px', borderRadius: '4px'
          }}
        >
          Nhân sự
          <span style={{ 
            transform: open ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </button>
      </div>

      {/* Members list */}
      <div style={{
        maxHeight: open ? '1000px' : '0',
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {unit.members && unit.members.length > 0 && (
          <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
            {unit.members.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9',
              }}>
                {m.avatar?.url ? (
                  <img src={m.avatar.url} alt={m.memberName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${color}15`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color, fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {m.memberName[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{m.memberName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{POSITION_LABELS[m.position] || m.position}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrgCardGrid({ units, themeColors }: { units: OrgUnit[]; themeColors: Record<string, string> }) {
  const sorted = [...units].sort((a, b) => (a.order || 99) - (b.order || 99));

  const groups: Record<string, { label: string; units: OrgUnit[] }> = {
    ban_lanh_dao: { label: '🏛️ Ban Lãnh đạo', units: [] },
    phong: { label: '🏢 Phòng chức năng', units: [] },
    khoa: { label: '🔬 Khoa chuyên môn', units: [] },
    khac: { label: '🏥 Đơn vị khác', units: [] },
  };
  sorted.forEach(u => {
    if (groups[u.unitType]) groups[u.unitType].units.push(u);
    else groups.khac.units.push(u);
  });

  return (
    <div>
      {Object.entries(groups).filter(([, g]) => g.units.length > 0).map(([key, group]) => (
        <div key={key} style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '1.25rem', fontWeight: 800,
            color: themeColors[key] || '#0f172a',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: `2px solid ${themeColors[key] ? `${themeColors[key]}30` : '#e2e8f0'}`,
            display: 'inline-block',
            paddingRight: '2rem'
          }}>
            {group.label}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {group.units.map(u => (
              <UnitCard key={u.id} unit={u as any} themeColors={themeColors} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
