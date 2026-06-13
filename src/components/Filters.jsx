// src/components/Filters.jsx
import React from 'react';

const LOCATIONS = [
  { value: 'india', label: 'India' },
  { value: 'remote', label: 'Remote' },
  { value: 'worldwide', label: 'Worldwide' },
];

const TIMES = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function FilterRow({ checked, label, count, onClick }) {
  return (
    <button className={`filter-row ${checked ? 'checked' : ''}`} onClick={onClick} type="button">
      <span className="fake-check" />
      <span className="filter-name">{label}</span>
      {count != null && <span className="filter-count">{count}</span>}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <section className="filter-section">
      <div className="filter-section-head">
        <span>{title}</span>
        <span className="chevron">^</span>
      </div>
      {children}
    </section>
  );
}

export default function Filters({ filters, sources, stats, onFilter, onReset }) {
  const overview = stats?.overview || {};
  const sourceRows = sources.slice(0, 5);

  return (
    <aside className="sidebar">
      <div className="filter-card">
        <div className="filter-top">
          <strong>Filters</strong>
          <button className="filter-reset" onClick={onReset} type="button">Reset</button>
        </div>

        <Section title="Location">
          <div className="filter-search">Search location...</div>
          {LOCATIONS.map(item => (
            <FilterRow
              key={item.value}
              checked={filters.geo === item.value}
              label={item.label}
              count={item.value === 'india' ? overview.india : item.value === 'remote' ? overview.remote : undefined}
              onClick={() => onFilter('geo', filters.geo === item.value ? 'all' : item.value)}
            />
          ))}
        </Section>

        <Section title="Time Posted">
          {TIMES.map(item => (
            <FilterRow
              key={item.value}
              checked={filters.time === item.value}
              label={item.label}
              count={item.value === '24h' ? overview.today : item.value === '7d' ? overview.week : undefined}
              onClick={() => onFilter('time', filters.time === item.value ? 'all' : item.value)}
            />
          ))}
        </Section>

        <Section title="Source">
          {sourceRows.map(item => (
            <FilterRow
              key={item.source}
              checked={filters.source === item.source}
              label={item.source}
              count={item.total}
              onClick={() => onFilter('source', filters.source === item.source ? 'all' : item.source)}
            />
          ))}
          {sources.length > sourceRows.length && <div className="show-more">Show more</div>}
        </Section>

        <Section title="Score">
          <div className="score-range-label">
            <span>{filters.minScore || 0}</span>
            <span>100</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={10}
            value={filters.minScore}
            onChange={e => onFilter('minScore', parseInt(e.target.value))}
          />
        </Section>
      </div>
    </aside>
  );
}
