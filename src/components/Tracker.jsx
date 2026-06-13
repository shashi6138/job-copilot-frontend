// src/components/Tracker.jsx
import React from 'react';
import { formatDate } from '../utils/helpers.js';

const STAGES = [
  { key: 'applied',   label: 'Applied',   cls: 'stage-applied',   color: 'var(--blue)'   },
  { key: 'screening', label: 'Screening', cls: 'stage-screening', color: 'var(--amber)'  },
  { key: 'interview', label: 'Interview', cls: 'stage-interview', color: 'var(--purple)' },
  { key: 'offer',     label: 'Offer',     cls: 'stage-offer',     color: 'var(--green)'  },
  { key: 'rejected',  label: 'Rejected',  cls: 'stage-rejected',  color: 'var(--red)'    },
];

export default function Tracker({ appData, onUpdateStatus, onOpenModal }) {
  const allApps  = Object.entries(appData);
  const stats    = STAGES.map(s => ({
    ...s,
    count: allApps.filter(([, a]) => a.status === s.key).length,
  }));

  return (
    <div className="tracker-wrap">
      {/* ── Top summary ──────────────────────────── */}
      <div className="tracker-top">
        <div className="tracker-title">Application Tracker</div>
        <div className="tracker-stats">
          {stats.map(s => (
            <div className="ts-item" key={s.key}>
              <div className="ts-num" style={{ color: s.color }}>{s.count}</div>
              <div className="ts-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kanban board ─────────────────────────── */}
      <div className="kanban-scroll">
        {allApps.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 80 }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">No applications tracked yet</div>
            <div className="empty-sub">Mark jobs as Applied in the jobs list and they'll appear here.</div>
          </div>
        ) : (
          <div className="kanban">
            {STAGES.map(stage => {
              const stageApps = allApps.filter(([, a]) => a.status === stage.key);
              return (
                <div key={stage.key} className={`k-col ${stage.cls}`}>
                  <div className="k-head">
                    <span className="k-title" style={{ color: stage.color }}>{stage.label}</span>
                    <span className="k-count">{stageApps.length}</span>
                  </div>
                  <div className="k-cards">
                    {stageApps.length === 0
                      ? <div className="k-empty">No applications</div>
                      : stageApps.map(([id, app]) => (
                        <AppCard
                          key={id}
                          id={id}
                          app={app}
                          stages={STAGES}
                          currentStage={stage.key}
                          onMove={(newStage) => onUpdateStatus(id, newStage)}
                          onOpen={() => onOpenModal(id)}
                        />
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AppCard({ id, app, stages, currentStage, onMove, onOpen }) {
  const isOverdue = app.followup && new Date(app.followup) < new Date();
  const days = app.appliedDate
    ? Math.round((Date.now() - new Date(app.appliedDate).getTime()) / 86_400_000)
    : null;

  return (
    <div className="k-card" onClick={onOpen}>
      <div className="k-card-title">{app.title || 'Unknown Role'}</div>
      <div className="k-card-co">{app.company || 'Unknown Company'}</div>
      {app.salary    && <div style={{ fontSize: 9, color: 'var(--green)', marginTop: 3 }}>💰 {app.salary}</div>}
      {app.recruiter && <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>👤 {app.recruiter}</div>}
      <div className={`k-card-date${isOverdue ? ' overdue' : ''}`}>
        {days !== null && `${days}d ago`}
        {app.followup && ` · Follow-up: ${formatDate(app.followup)}`}
        {isOverdue     && ' ⚠ Overdue'}
      </div>
      <div className="k-card-actions" onClick={e => e.stopPropagation()}>
        {stages.filter(s => s.key !== currentStage).slice(0, 3).map(s => (
          <button key={s.key} className="k-card-btn" onClick={() => onMove(s.key)}>
            → {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
