'use client';

import React, { useState } from 'react';

type OrgUnit = {
  id: string;
  name: string;
  unitType: 'ban_lanh_dao' | 'phong' | 'khoa' | 'khac';
  order: number;
  shortDescription?: string;
  phone?: string;
  email?: string;
  members?: Array<{
    memberName: string;
    position: string;
    academicTitle?: string;
    avatar?: { url: string; alt?: string };
  }>;
};

type Props = {
  units: OrgUnit[];
  themeColors?: {
    ban_lanh_dao?: string;
    phong?: string;
    khoa?: string;
    khac?: string;
  };
};

const TYPE_COLORS: Record<string, string> = {
  ban_lanh_dao: '#0d47a1', // Dark blue
  phong: '#2e7d32',        // Green
  khoa: '#1976d2',         // CDC Blue
  khac: '#e65100',
};

const TYPE_LABELS: Record<string, string> = {
  ban_lanh_dao: 'Ban Lãnh đạo',
  phong: 'Phòng',
  khoa: 'Khoa',
  khac: 'Đơn vị khác',
};

function OrgNode({ unit, isActive, onClick, colors }: { unit: OrgUnit; isActive: boolean; onClick: () => void; colors: Record<string, string> }) {
  const color = colors[unit.unitType] || '#455a64';
  const memberCount = unit.members?.length || 0;
  const leaders = unit.members?.filter(m =>
    ['giam_doc', 'pho_giam_doc', 'truong', 'pho_truong'].includes(m.position)
  ) || [];

  return (
    <button
      id={`org-node-${unit.id}`}
      className={`org-node ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ '--node-color': color } as React.CSSProperties}
      aria-pressed={isActive}
      title={`Xem nhân sự ${unit.name}`}
    >
      <div className="node-header">
        <span className="node-type-badge">{TYPE_LABELS[unit.unitType]}</span>
      </div>
      <div className="node-name">{unit.name}</div>
      {leaders.length > 0 && (
        <div className="node-leader">
          {leaders.map((l, i) => (
            <span key={i} className="leader-name">{l.memberName}</span>
          ))}
        </div>
      )}
      {unit.phone && (
        <div className="node-contact">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          {unit.phone}
        </div>
      )}
      {unit.email && (
        <div className="node-contact">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          {unit.email}
        </div>
      )}

      <style>{`
        .org-node {
          background: white;
          border: 1px solid #f1f5f9;
          border-bottom: 3px solid var(--node-color);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          min-width: 160px;
          max-width: 220px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          position: relative;
        }
        .org-node:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
          border-color: color-mix(in srgb, var(--node-color) 20%, transparent);
        }
        .org-node.active {
          transform: translateY(-2px);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--node-color);
          border-color: var(--node-color);
        }
        .node-header {
          margin-bottom: 0.5rem;
        }
        .node-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--node-color);
          background: color-mix(in srgb, var(--node-color) 8%, transparent);
          padding: 3px 8px;
          border-radius: 999px;
          display: inline-block;
        }
        .node-name {
          font-size: 0.9rem;
          font-weight: 800;
          line-height: 1.3;
          margin: 0.25rem 0;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .leader-name {
          font-size: 0.75rem;
          display: block;
          color: #64748b;
          font-weight: 500;
          margin-top: 4px;
        }
        .node-contact {
          font-size: 0.75rem;
          margin-top: 0.25rem;
          color: #94a3b8;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
      `}</style>
    </button>
  );
}

export function OrgChart({ units, themeColors }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const colors = { ...TYPE_COLORS, ...themeColors };

  const handleNodeClick = (unitId: string) => {
    setActiveId(prev => prev === unitId ? null : unitId);
    setTimeout(() => {
      const el = document.getElementById(`accordion-${unitId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.querySelector('button')?.click();
      }
    }, 100);
  };

  const leadership = units.filter(u => u.unitType === 'ban_lanh_dao');
  const departments = units.filter(u => u.unitType !== 'ban_lanh_dao');
  const deptGroups: Record<string, OrgUnit[]> = {};
  departments.forEach(d => {
    if (!deptGroups[d.unitType]) deptGroups[d.unitType] = [];
    deptGroups[d.unitType].push(d);
  });

  return (
    <div className="org-chart">
      {leadership.length > 0 && (
        <div className="org-level leadership-level">
          {leadership.map(unit => (
            <OrgNode
              key={unit.id}
              unit={unit}
              isActive={activeId === unit.id}
              onClick={() => handleNodeClick(unit.id)}
              colors={colors}
            />
          ))}
        </div>
      )}

      {leadership.length > 0 && departments.length > 0 && (
        <div className="connector-v" aria-hidden="true" />
      )}

      {Object.entries(deptGroups).map(([type, group]) => (
        <div key={type} className="dept-group">
          <div className="dept-group-label" style={{ color: colors[type] || colors.khac }}>
            {TYPE_LABELS[type]}
          </div>
          <div className="org-level dept-level">
            {group.map(unit => (
              <OrgNode
                key={unit.id}
                unit={unit}
                isActive={activeId === unit.id}
                onClick={() => handleNodeClick(unit.id)}
                colors={colors}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="org-chart-hint" aria-live="polite">
        👆 Click vào ô để xem danh sách nhân sự
      </p>

      <style>{`
        .org-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          padding: 1rem;
        }
        .org-level {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          width: 100%;
        }
        .leadership-level {
          gap: 1.5rem;
          margin-bottom: 0;
        }
        .connector-v {
          width: 2px;
          height: 2.5rem;
          background: linear-gradient(to bottom, #cbd5e1, rgba(203, 213, 225, 0));
          margin: 0.5rem 0;
        }
        .dept-group {
          width: 100%;
          margin-top: 1.5rem;
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.01);
          border: 1px solid #f1f5f9;
        }
        .dept-group-label {
          text-align: center;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dept-group-label::before,
        .dept-group-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: currentColor;
          opacity: 0.15;
        }
        .dept-level {
          justify-content: center;
        }
        .org-chart-hint {
          margin-top: 2rem;
          font-size: 0.85rem;
          color: #94a3b8;
          text-align: center;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
