// src/components/JobDetail.jsx
import React, { useState, useEffect } from 'react';
import {
  timeDiff, formatDate, sourceFullName, geoLabel,
} from '../utils/helpers.js';

function CompanyMark({ name }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return <span className="detail-company-mark">{initial}</span>;
}

function Tag({ children }) {
  return <span className="detail-tag">{children}</span>;
}

export default function JobDetail({
  job, savedIds, appliedIds, notes,
  onSave, onApply, onSaveNote, onOpenTracker,
}) {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(notes[job?.id] || '');
  }, [job?.id, notes]);

  if (!job) {
    return (
      <aside className="detail-panel">
        <div className="detail-empty">
          <div className="detail-empty-icon">Select</div>
          <div className="detail-empty-txt">Choose a job to view details</div>
        </div>
      </aside>
    );
  }

  const saved = savedIds.has(job.id);
  const applied = appliedIds.has(job.id);
  const source = sourceFullName(job.source);
  const score = Math.max(0, Math.min(100, Number(job.rank_score) || 0));
  const skills = Array.isArray(job.skills) ? job.skills.slice(0, 6) : [];

  function saveNote() {
    onSaveNote(job.id, note);
  }

  return (
    <aside className="detail-panel">
      <div className="detail-card">
        <div className="detail-toolbar">
          <span className="match-badge">{score}% Match</span>
          <div className="detail-toolbar-actions">
            <button
              className={`icon-btn ${saved ? 'active' : ''}`}
              onClick={() => onSave(job.id)}
              type="button"
              title={saved ? 'Unsave job' : 'Save job'}
            >
              {saved ? '◆' : '◇'}
            </button>
            <button className="icon-btn" type="button" title="Close">×</button>
          </div>
        </div>

        <div className="detail-heading">
          <CompanyMark name={job.company} />
          <div>
            <h2>{job.title}</h2>
            <div className="detail-company-line">
              <span>{job.company}</span>
              {applied && <span className="verified-dot" />}
            </div>
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              {source}
            </a>
          </div>
        </div>

        <div className="detail-tags">
          <Tag>{geoLabel(job.geo)}</Tag>
          <Tag>{job.remote_type || 'Remote friendly'}</Tag>
          <Tag>{job.location || 'Anywhere'}</Tag>
        </div>

        <div className="detail-stats">
          <div>
            <strong>{job.salary || 'Not listed'}</strong>
            <span>Est. Salary</span>
          </div>
          <div>
            <strong>{timeDiff(job.posted_at) || '-'}</strong>
            <span>Posted</span>
          </div>
          <div>
            <strong>{formatDate(job.fetched_at || job.posted_at)}</strong>
            <span>Updated</span>
          </div>
        </div>

        <section className="detail-block">
          <h3>Requirements</h3>
          <div className="detail-tags">
            {(skills.length ? skills : ['Technical Support', 'Customer Success', 'Troubleshooting']).map(skill => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </section>

        <section className="detail-block">
          <h3>Job Description</h3>
          <p className="jd-text">
            {job.description || 'Open the company posting to view the full job description, responsibilities, and hiring process.'}
          </p>
        </section>

        <section className="detail-block notes-block">
          <h3>My Notes</h3>
          <textarea
            className="notes-area"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Recruiter name, salary discussed, interview stage..."
          />
          <button className="btn" onClick={saveNote} type="button">Save Note</button>
        </section>

        <div className="detail-footer-actions">
          <a className="apply-cta" href={job.apply_url} target="_blank" rel="noopener noreferrer">
            Apply Now <span>→</span>
          </a>
          <button
            className={`btn ${applied ? 'active-soft' : ''}`}
            onClick={() => onApply(job)}
            type="button"
          >
            {applied ? 'Applied' : 'Mark Applied'}
          </button>
          {applied && (
            <button className="btn" onClick={() => onOpenTracker(job.id)} type="button">
              Update Status
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
