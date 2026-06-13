// src/App.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useJobs, useTracker } from './hooks/useJobs.js';
import StatsCards from './components/StatsCards.jsx';
import Filters from './components/Filters.jsx';
import JobsTable from './components/JobsTable.jsx';
import JobDetail from './components/JobDetail.jsx';
import Tracker from './components/Tracker.jsx';
import Analytics from './components/Analytics.jsx';
import AppModal, { Pagination } from './components/AppModal.jsx';
import { timeDiff } from './utils/helpers.js';
import api from './utils/api.js';

const TABS = [
  { key: 'jobs', label: 'Dashboard' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'tracker', label: 'Tracker' },
];

export default function App() {
  const {
    jobs, stats, sources, meta, filters,
    loading, statsLoading, banner, setBanner,
    setFilter, resetFilters, goToPage, fetchJobs, fetchStats,
  } = useJobs();

  const {
    savedIds, appliedIds, appData, notes,
    toggleSave, markApplied, updateAppData, saveNote,
  } = useTracker();

  const [tab, setTab] = useState('jobs');
  const [selJob, setSelJob] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const detailReqRef = useRef(0);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchJobs();
    await fetchStats();
    setRefreshing(false);
  }

  async function handleScrape() {
    const key = prompt('Enter admin API key:');
    if (!key) return;

    try {
      await api.triggerScrape(key);
      setBanner({ msg: 'Scrape started. Refresh in about 2 minutes.', type: 'success' });
    } catch {
      setBanner({ msg: 'Scrape trigger failed. Check your API key.', type: 'error' });
    }
  }

  const openJob = useCallback(async (job) => {
    if (!job) return;

    const reqId = ++detailReqRef.current;
    setSelJob(job);

    try {
      const data = await api.getJob(job.id);
      if (reqId === detailReqRef.current && data.success) {
        setSelJob({ ...job, ...data.data });
      }
    } catch {
      // Keep row data visible if the detail fetch fails.
    }
  }, []);

  const handleSelect = useCallback((job) => {
    openJob(job);
  }, [openJob]);

  useEffect(() => {
    if (!jobs.length) {
      setSelJob(null);
      return;
    }

    const selectedStillVisible = selJob && jobs.some(job => job.id === selJob.id);
    if (!selectedStillVisible) openJob(jobs[0]);
  }, [jobs, selJob, openJob]);

  function handleApply(job) {
    markApplied(job.id, job);
    if (!appliedIds.has(job.id)) {
      setTimeout(() => setModalId(job.id), 100);
    }
  }

  function handleCardClick(key) {
    if (key === 'india') {
      setFilter('geo', 'india');
      setFilter('time', 'all');
    } else if (key === 'remote') {
      setFilter('geo', 'remote');
      setFilter('time', 'all');
    } else if (key === '24h') {
      setFilter('time', '24h');
      setFilter('geo', 'all');
    } else {
      setFilter('geo', 'all');
      setFilter('time', 'all');
    }
  }

  function activeView() {
    if (filters.geo === 'india') return 'india';
    if (filters.geo === 'remote') return 'remote';
    if (filters.time === '24h') return '24h';
    return 'all';
  }

  const lastRun = stats?.lastRun;
  const lastRunText = lastRun
    ? `Last scrape: ${timeDiff(lastRun.started_at)} · ${lastRun.jobs_new ?? 0} new`
    : 'Never scraped';

  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo-block">
          <div className="logo-mark">JT</div>
          <div className="logo-name head">JobTracker</div>
        </div>

        <div className="top-search input-wrap">
          <span className="input-icon">⌕</span>
          <input
            className="input with-icon"
            placeholder="Search jobs, companies, roles..."
            value={filters.q}
            onChange={e => setFilter('q', e.target.value)}
          />
          <span className="kbd">Ctrl K</span>
        </div>

        <div className="topbar-right">
          <button className="btn" onClick={handleRefresh} disabled={refreshing || loading} type="button">
            {(refreshing || loading) ? <><span className="spin-muted" /> Loading</> : 'Refresh'}
          </button>

          <nav className="tab-switcher" aria-label="Primary">
            {TABS.map(item => (
              <button
                key={item.key}
                className={tab === item.key ? 'active' : ''}
                onClick={() => setTab(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <span className="last-run">{lastRunText}</span>
          <button className="icon-btn" onClick={handleScrape} title="Trigger scrape" type="button">↻</button>
          <button className="icon-btn" title="Notifications" type="button">!</button>
          <div className="avatar">S</div>
        </div>
      </header>

      {banner && (
        <div className={`banner ${banner.type}`}>
          {banner.msg}
          <button className="banner-x" onClick={() => setBanner(null)} type="button">x</button>
        </div>
      )}

      {tab === 'jobs' && (
        <>
          <StatsCards
            stats={stats}
            loading={statsLoading}
            activeView={activeView()}
            onCardClick={handleCardClick}
          />

          <main className="body-row">
            <Filters
              filters={filters}
              sources={sources}
              stats={stats}
              onFilter={setFilter}
              onReset={resetFilters}
            />

            <section className="main-content">
              <div className="content-header">
                <div className="result-count">
                  {loading ? <><span className="spin-muted" /> Loading...</> : `${meta.total} jobs · page ${meta.page}/${meta.pages}`}
                </div>
                {filters.q || filters.geo !== 'all' || filters.time !== 'all' || filters.minScore > 0 ? (
                  <button className="btn small" onClick={resetFilters} type="button">Clear</button>
                ) : null}
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: loading ? '70%' : '0%' }} />
              </div>

              <JobsTable
                jobs={jobs}
                loading={loading}
                selectedId={selJob?.id}
                savedIds={savedIds}
                appliedIds={appliedIds}
                onSelect={handleSelect}
                onSave={toggleSave}
                onApply={handleApply}
                onSortChange={(col) => setFilter('sort', col)}
                currentSort={filters.sort}
              />

              <Pagination meta={meta} onPage={goToPage} />
            </section>

            <JobDetail
              job={selJob}
              savedIds={savedIds}
              appliedIds={appliedIds}
              notes={notes}
              onSave={toggleSave}
              onApply={handleApply}
              onSaveNote={saveNote}
              onOpenTracker={(id) => setModalId(id)}
            />
          </main>
        </>
      )}

      {tab === 'tracker' && (
        <Tracker
          appData={appData}
          onUpdateStatus={(id, status) => updateAppData(id, { status })}
          onOpenModal={(id) => setModalId(id)}
        />
      )}

      {tab === 'analytics' && <Analytics stats={stats} />}

      {modalId && (
        <AppModal
          jobId={modalId}
          appData={appData}
          onSave={(id, form) => updateAppData(id, form)}
          onClose={() => setModalId(null)}
        />
      )}
    </div>
  );
}
