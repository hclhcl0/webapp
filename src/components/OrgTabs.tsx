'use client';
import React, { useState } from 'react';

type Member = {
  id: string;
  memberName: string;
  position: string;
  academicTitle?: string;
  email?: string;
  avatar?: { url?: string };
};

type OrgUnit = {
  id: string;
  name: string;
  unitType: string;
  order: number;
  shortDescription?: string;
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

const TABS = [
  { key: 'ban_lanh_dao', label: '🏛️ Ban Lãnh đạo', color: '#0ea5e9' }, // Teal/blue
  { key: 'phong', label: '🏢 Phòng chức năng', color: '#10b981' }, // Emerald
  { key: 'khoa', label: '🔬 Khoa chuyên môn', color: '#3b82f6' }, // Blue
];

function MemberCard({ member, color }: { member: Member; color: string }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.25rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 10px 20px -5px ${color}20`;
      e.currentTarget.style.borderColor = `${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)';
      e.currentTarget.style.borderColor = '#f1f5f9';
    }}>
      {member.avatar?.url ? (
        <div style={{ position: 'relative' }}>
          <img
            src={member.avatar.url}
            alt={member.memberName}
            style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '1rem', 
              objectFit: 'cover',
              boxShadow: `0 4px 10px ${color}30`
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1rem',
            border: `1px solid ${color}30`,
            pointerEvents: 'none'
          }} />
        </div>
      ) : (
        <div style={{
          width: 64, height: 64, borderRadius: '1rem',
          background: `linear-gradient(135deg, ${color}10 0%, ${color}25 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color, fontWeight: 700, fontSize: '1.5rem', flexShrink: 0,
        }}>
          {member.memberName[0]}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 700, 
          color: '#0f172a', 
          fontSize: '1.05rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {member.memberName}
        </div>
        <div style={{
          fontSize: '0.8rem', color: color,
          background: `${color}15`, 
          padding: '4px 10px',
          borderRadius: '20px', 
          display: 'inline-block', 
          marginTop: '0.35rem', 
          fontWeight: 600,
          border: `1px solid ${color}25`
        }}>
          {POSITION_LABELS[member.position] || member.position}
        </div>
        {member.email && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {member.email}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrgTabs({ units, themeColors }: { units: OrgUnit[]; themeColors: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState('ban_lanh_dao');
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  const sorted = [...units].sort((a, b) => (a.order || 99) - (b.order || 99));

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const color = themeColors[activeTab] || currentTab.color;
  const filteredUnits = sorted.filter(u => u.unitType === activeTab);

  return (
    <div>
      {/* Pill Tab bar */}
      <div style={{
        display: 'flex', 
        gap: '0.5rem',
        marginBottom: '2rem',
        background: '#f1f5f9',
        padding: '0.5rem',
        borderRadius: '100px',
        width: 'fit-content',
        overflowX: 'auto',
      }}>
        {TABS.map(tab => {
          const c = themeColors[tab.key] || tab.color;
          const count = sorted.filter(u => u.unitType === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setOpenUnit(null); }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '100px',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? c : '#64748b',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.label}
              <span style={{
                background: isActive ? `${c}15` : '#e2e8f0',
                color: isActive ? c : '#64748b',
                padding: '2px 8px', 
                borderRadius: '20px',
                fontSize: '0.75rem', 
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredUnits.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem', background: '#f8fafc', borderRadius: '1rem' }}>
            Chưa có dữ liệu cho mục này
          </p>
        )}
        {filteredUnits.map((unit, index) => {
          // If it's Ban Lanh Dao, we might want to default open the first one
          const isOpen = openUnit === unit.id || (activeTab === 'ban_lanh_dao' && openUnit === null && index === 0);
          
          return (
            <div key={unit.id} style={{
              background: '#ffffff',
              border: `1px solid ${isOpen ? `${color}40` : '#e2e8f0'}`,
              borderRadius: '1.25rem',
              overflow: 'hidden',
              boxShadow: isOpen ? `0 10px 25px -5px ${color}15` : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
            }}>
              {/* Unit header */}
              <button
                onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                style={{
                  width: '100%', 
                  padding: '1.25rem 1.5rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: isOpen ? `${color}05` : 'white',
                  border: 'none', 
                  cursor: 'pointer',
                  borderBottom: isOpen ? `1px solid ${color}15` : 'none',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1.25rem',
                    boxShadow: `0 4px 10px ${color}40`
                  }}>
                    {unit.name[0]}
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{unit.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {unit.phone && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          {unit.phone}
                        </div>
                      )}
                      {unit.email && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          {unit.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isOpen ? color : '#64748b' }}>Nhân sự</span>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: isOpen ? `${color}15` : '#f1f5f9',
                    color: isOpen ? color : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </button>

              {/* Members grid */}
              <div style={{
                maxHeight: isOpen ? '2000px' : '0',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {unit.members && unit.members.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: '#f8fafc',
                  }}>
                    {unit.members.map(m => (
                      <MemberCard key={m.id} member={m} color={color} />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc' }}>
                    Đang cập nhật danh sách nhân sự
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
