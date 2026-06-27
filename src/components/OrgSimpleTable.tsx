'use client';
import React, { useState } from 'react';

type Member = {
  id: string;
  memberName: string;
  position: string;
  email?: string;
  avatar?: { url?: string };
};

type OrgUnit = {
  id: string;
  name: string;
  unitType: string;
  order: number;
  phone?: string;
  email?: string;
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

const TYPE_INFO: Record<string, { label: string; color: string }> = {
  ban_lanh_dao: { label: 'Ban Lãnh đạo', color: '#0ea5e9' },
  phong: { label: 'Phòng chức năng', color: '#10b981' },
  khoa: { label: 'Khoa chuyên môn', color: '#3b82f6' },
  khac: { label: 'Đơn vị khác', color: '#f59e0b' },
};

export function OrgSimpleTable({ units, themeColors }: { units: OrgUnit[]; themeColors: Record<string, string> }) {
  const sorted = [...units].sort((a, b) => (a.order || 99) - (b.order || 99));
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        fontSize: '0.95rem',
        background: 'white',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        border: '1px solid #f1f5f9',
      }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, width: 40, borderBottom: '1px solid #e2e8f0' }}>STT</th>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Tên đơn vị</th>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, width: 180, borderBottom: '1px solid #e2e8f0' }}>Loại</th>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 700, width: 220, borderBottom: '1px solid #e2e8f0' }}>Trưởng đơn vị</th>
            <th style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 700, width: 100, borderBottom: '1px solid #e2e8f0' }}>Nhân sự</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((unit, idx) => {
            const typeInfo = TYPE_INFO[unit.unitType] || TYPE_INFO.khac;
            const color = themeColors[unit.unitType] || typeInfo.color;
            const leader = unit.members?.find(m => ['giam_doc', 'truong', 'pho_giam_doc'].includes(m.position));
            const isExpanded = expanded === unit.id;

            return (
              <React.Fragment key={unit.id}>
                <tr
                  onClick={() => setExpanded(isExpanded ? null : unit.id)}
                  style={{
                    cursor: 'pointer',
                    background: isExpanded ? `${color}05` : 'white',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) e.currentTarget.style.background = 'white';
                  }}
                >
                  <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{idx + 1}</td>
                  <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{unit.name}</span>
                        {isExpanded && (
                          <span style={{ fontSize: '0.75rem', color: color, background: `${color}15`, padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            Thu gọn 
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                        {unit.phone && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            {unit.phone}
                          </span>
                        )}
                        {unit.email && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            {unit.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 700,
                      color, background: `${color}15`,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {typeInfo.label}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155', fontSize: '0.9rem', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                    {leader ? leader.memberName : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 32, height: 32, lineHeight: '32px',
                      borderRadius: '50%', background: isExpanded ? `${color}20` : '#f1f5f9',
                      color: isExpanded ? color : '#64748b', fontWeight: 700, fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}>
                      {unit.members?.length || 0}
                    </span>
                  </td>
                </tr>
                {/* Expanded member row */}
                {isExpanded && unit.members && unit.members.length > 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.02)' }}>
                        {unit.members.map(m => (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'white', border: `1px solid ${color}20`,
                            borderRadius: '1rem', padding: '0.75rem 1rem',
                            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.02)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${color}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.02)';
                          }}>
                            {m.avatar?.url ? (
                              <img src={m.avatar.url} alt={m.memberName}
                                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}10` }} />
                            ) : (
                              <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`, color: color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem', fontWeight: 800,
                              }}>{m.memberName[0]}</div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{m.memberName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                                {POSITION_LABELS[m.position] || m.position}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#aaa', marginTop: '0.75rem' }}>
        💡 Click vào hàng để xem danh sách nhân sự
      </p>
    </div>
  );
}
