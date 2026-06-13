// src/components/StatsCards.jsx
import React from 'react';

const CARDS = [
  { key: 'total', label: 'Jobs', sub: 'Total available jobs', icon: 'briefcase', view: 'all' },
  { key: 'india', label: 'India', sub: 'Jobs in India', icon: 'globe', view: 'india' },
  { key: 'remote', label: 'Remote', sub: 'Work from anywhere', icon: 'wifi', view: 'remote' },
  { key: 'today', label: 'Today', sub: 'New jobs added today', icon: 'trend', view: '24h', plus: true },
  { key: 'highScore', label: 'Score', sub: 'High match score jobs', icon: 'star', view: 'all', suffix: '+' },
];

function Sparkline({ variant = 0 }) {
  const paths = [
    'M1 22 L7 18 L13 20 L19 9 L25 15 L31 5 L38 10 L45 8 L53 15',
    'M1 24 C10 24 9 10 18 12 C27 14 24 22 34 18 C43 14 42 5 53 8',
    'M1 18 L6 14 L12 17 L18 9 L24 13 L30 6 L36 16 L42 12 L53 20',
  ];

  return (
    <svg className="metric-spark" viewBox="0 0 54 28" aria-hidden="true">
      <path d={paths[variant % paths.length]} />
    </svg>
  );
}

export default function StatsCards({ stats, activeView, onCardClick, loading }) {
  const overview = stats?.overview || {};

  return (
    <div className="stat-cards">
      {CARDS.map((card, index) => {
        const value = overview[card.key] ?? 0;
        return (
          <button
            key={card.key}
            className={`stat-card ${activeView === card.view ? 'active' : ''}`}
            onClick={() => onCardClick(card.view)}
            type="button"
          >
            <span className={`metric-icon ${card.icon}`} />
            <span className="metric-copy">
              <span className="stat-num">
                {loading ? '-' : `${card.plus ? '+' : ''}${value}${card.suffix || ''}`}
              </span>
              <span className="stat-lbl">{card.label}</span>
              <span className="stat-sub">{card.sub}</span>
            </span>
            <Sparkline variant={index} />
          </button>
        );
      })}
    </div>
  );
}
