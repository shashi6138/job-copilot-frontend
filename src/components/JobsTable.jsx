// src/components/JobsTable.jsx
import React from 'react';
import {
  timeDiff, freshBadge, sourceLabel, geoLabel,
} from '../utils/helpers.js';

function CompanyMark({ name }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return <span className="company-mark">{initial}</span>;
}

function MatchRing({ score = 0 }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <span className="match-ring" style={{ '--score': `${value * 3.6}deg` }}>
      <span>{value}</span>
      <small>Match</small>
    </span>
  );
}

export default function JobsTable({
  jobs, loading, selectedId, savedIds, appliedIds,
  onSelect, onSave, onApply, onSortChange, currentSort,
}) {
  if (loading && !jobs.length) {
    return (
      <div className="empty-state">
        <div className="spin-muted" />
        <span>Loading jobs...</span>
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="empty-state">
        <div className="empty-title">No jobs found</div>
        <div className="empty-sub">Try widening your filters or click Refresh.</div>
      </div>
    );
  }

  return (
    <div className="jobs-scroll">
      <div className="job-list-head">
        <div className="input-wrap job-list-search">
          <span className="input-icon">⌕</span>
          <input className="input with-icon" placeholder="Search jobs..." readOnly />
        </div>
        <label className="sort-select">
          <span>Sort by:</span>
          <select value={currentSort} onChange={e => onSortChange(e.target.value)}>
            <option value="rank">Best Match</option>
            <option value="date">Newest First</option>
            <option value="company">Company A-Z</option>
          </select>
        </label>
      </div>

      <div className="job-cards">
        {jobs.map(job => {
          const saved = savedIds.has(job.id);
          const applied = appliedIds.has(job.id);
          const selected = selectedId === job.id;
          const fb = freshBadge(job.posted_at);

          return (
            <article
              key={job.id}
              className={`job-card ${selected ? 'selected' : ''} ${applied ? 'applied' : ''}`}
              onClick={() => onSelect(job)}
            >
              <CompanyMark name={job.company} />

              <div className="job-card-main">
                <div className="job-title-row">
                  <h3>{job.title}</h3>
                  {applied && <span className="verified-dot" title="Applied" />}
                </div>
                <div className="job-company">{job.company}</div>
                <div className="job-meta">
                  <span>{geoLabel(job.geo)}</span>
                  <span>{job.location || 'Anywhere'}</span>
                  <span>{sourceLabel(job.source)}</span>
                </div>
                <div className="job-posted">
                  {fb ? fb.label : timeDiff(job.posted_at) || 'Recently posted'}
                </div>
              </div>

              <MatchRing score={job.rank_score} />

              <button
                className={`bookmark-btn ${saved ? 'saved' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  onSave(job.id);
                }}
                type="button"
                title={saved ? 'Unsave' : 'Save job'}
              >
                {saved ? '◆' : '◇'}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
