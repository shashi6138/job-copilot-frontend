// src/components/AppModal.jsx
import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'applied',   label: 'Applied'          },
  { value: 'screening', label: 'Phone Screening'  },
  { value: 'interview', label: 'Interview'         },
  { value: 'offer',     label: 'Offer Received'   },
  { value: 'rejected',  label: 'Rejected'         },
  { value: 'withdrawn', label: 'Withdrawn'        },
];

export default function AppModal({ jobId, appData, onSave, onClose }) {
  const existing = appData[jobId] || {};
  const [form, setForm] = useState({
    status:    existing.status    || 'applied',
    recruiter: existing.recruiter || '',
    salary:    existing.salary    || '',
    followup:  existing.followup  || '',
    notes:     existing.notes     || '',
  });

  useEffect(() => {
    const existing = appData[jobId] || {};
    setForm({
      status:    existing.status    || 'applied',
      recruiter: existing.recruiter || '',
      salary:    existing.salary    || '',
      followup:  existing.followup  || '',
      notes:     existing.notes     || '',
    });
  }, [jobId, appData]);

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  function handleSave() {
    onSave(jobId, form);
    onClose();
  }

  const job = existing;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">
          {job.title || 'Application'} — {job.company || ''}
        </div>
        <div className="modal-sub">Track your application status and add notes.</div>

        <div className="modal-row">
          <label className="modal-lbl">Status</label>
          <select className="input select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="modal-row">
          <label className="modal-lbl">Recruiter Name</label>
          <input className="input" placeholder="e.g. Priya Sharma" value={form.recruiter}
            onChange={e => set('recruiter', e.target.value)} />
        </div>

        <div className="modal-row">
          <label className="modal-lbl">Salary Discussed</label>
          <input className="input" placeholder="e.g. ₹12–15 LPA" value={form.salary}
            onChange={e => set('salary', e.target.value)} />
        </div>

        <div className="modal-row">
          <label className="modal-lbl">Follow-up Date</label>
          <input className="input" type="date" value={form.followup}
            onChange={e => set('followup', e.target.value)} />
        </div>

        <div className="modal-row">
          <label className="modal-lbl">Notes</label>
          <textarea className="input notes-area" rows={3} placeholder="Anything to remember…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────
export function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null;
  const { page, pages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <div className="page-info">
        Showing {from}–{to} of {total} jobs
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn small" disabled={page <= 1} onClick={() => onPage(1)}>«</button>
        <button className="btn small" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
        {/* Page number buttons */}
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let p;
          if (pages <= 5)       p = i + 1;
          else if (page <= 3)   p = i + 1;
          else if (page >= pages - 2) p = pages - 4 + i;
          else p = page - 2 + i;
          return (
            <button
              key={p}
              className={`btn small${p === page ? ' primary' : ''}`}
              onClick={() => onPage(p)}
              style={p === page ? {} : {}}
            >
              {p}
            </button>
          );
        })}
        <button className="btn small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next ›</button>
        <button className="btn small" disabled={page >= pages} onClick={() => onPage(pages)}>»</button>
      </div>
    </div>
  );
}
