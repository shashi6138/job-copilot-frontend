// src/components/Analytics.jsx
import React from 'react';
import { sourceFullName } from '../utils/helpers.js';

function BarChart({ data, valueKey = 'count', labelKey = 'source', colorFn, maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div>
      {data.map((item, i) => (
        <div key={i} className="bar-row">
          <div className="bar-label" title={item[labelKey]}>
            {item[labelKey]}
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.round((item[valueKey] / max) * 100)}%`,
                background: colorFn ? colorFn(item, i) : 'var(--lime)' }}
            />
          </div>
          <div className="bar-val">{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }) {
  if (!data || !data.length) return <div style={{ color: 'var(--dim)', fontSize: 11 }}>No trend data yet</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{
            width: '100%', borderRadius: 3,
            height: `${Math.max(4, Math.round((d.count / max) * 52))}px`,
            background: 'var(--lime)', opacity: 0.6 + (i / data.length) * 0.4,
            transition: 'height .4s',
          }} title={`${d.date}: ${d.count} jobs`} />
          <div style={{ fontSize: 8, color: 'var(--dim)', whiteSpace: 'nowrap' }}>
            {d.date?.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
}

const GEO_COLORS = {
  india:     'var(--india)',
  remote:    'var(--remote)',
  worldwide: 'var(--world)',
  hybrid:    'var(--amber)',
};
const SRC_COLORS = ['var(--green)','var(--purple)','var(--amber)','var(--blue)','var(--orange)','var(--red)'];
const SCORE_COLORS = {
  excellent: 'var(--green)',
  good:      'var(--lime)',
  fair:      'var(--amber)',
  low:       'var(--dim)',
};

export default function Analytics({ stats }) {
  if (!stats) {
    return (
      <div className="analytics-wrap">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Loading analytics…</div>
        </div>
      </div>
    );
  }

  const { bySrc = [], byGeo = [], trend = [], topCompanies = [], scoreDistrib = [], lastRun } = stats;

  const bySourceMapped = bySrc.map(s => ({
    ...s,
    source: sourceFullName(s.source),
  }));

  const byGeoMapped = byGeo.map(g => ({
    ...g,
    label: { india: '🇮🇳 India', remote: '🌐 Remote', worldwide: '🌍 Worldwide', hybrid: '🏢 Hybrid' }[g.geo] || g.geo,
  }));

  return (
    <div className="analytics-wrap">
      <div className="analytics-grid">

        {/* Jobs by Source */}
        <div className="analytics-card">
          <div className="analytics-title">Jobs by Source</div>
          <BarChart
            data={bySourceMapped}
            labelKey="source"
            colorFn={(_, i) => SRC_COLORS[i % SRC_COLORS.length]}
          />
        </div>

        {/* Jobs by Location */}
        <div className="analytics-card">
          <div className="analytics-title">Jobs by Location</div>
          <BarChart
            data={byGeoMapped}
            labelKey="label"
            colorFn={(item) => GEO_COLORS[item.geo] || 'var(--lime)'}
          />
        </div>

        {/* 7-day Trend */}
        <div className="analytics-card">
          <div className="analytics-title">Jobs Added — Last 7 Days</div>
          <TrendChart data={trend} />
        </div>

        {/* Score Distribution */}
        <div className="analytics-card">
          <div className="analytics-title">Relevance Score Distribution</div>
          <BarChart
            data={scoreDistrib.map(s => ({ ...s, label: s.tier.charAt(0).toUpperCase() + s.tier.slice(1) }))}
            labelKey="label"
            colorFn={(item) => SCORE_COLORS[item.tier] || 'var(--lime)'}
          />
        </div>

        {/* Top Companies */}
        <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
          <div className="analytics-title">Top Companies by Job Count</div>
          <BarChart
            data={topCompanies.slice(0, 8).map(c => ({ ...c, label: c.company }))}
            labelKey="label"
            colorFn={() => 'var(--lime)'}
          />
        </div>

        {/* Last Run Info */}
        {lastRun && (
          <div className="analytics-card" style={{ gridColumn: '1 / -1' }}>
            <div className="analytics-title">Last Scraper Run</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { label: 'Status',     value: lastRun.status,     color: lastRun.status === 'success' ? 'var(--green)' : 'var(--red)' },
                { label: 'Jobs Found', value: lastRun.jobs_found  ?? '—' },
                { label: 'New Jobs',   value: lastRun.jobs_new    ?? '—' },
                { label: 'Started',    value: lastRun.started_at ? new Date(lastRun.started_at).toLocaleTimeString('en-IN') : '—' },
              ].map(item => (
                <div key={item.label} className="info-cell">
                  <div className="info-lbl">{item.label}</div>
                  <div className="info-val" style={item.color ? { color: item.color } : {}}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {lastRun.error_msg && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>
                Error: {lastRun.error_msg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
