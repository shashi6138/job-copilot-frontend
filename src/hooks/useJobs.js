// src/hooks/useJobs.js
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api.js';
import { lsk, lss } from '../utils/helpers.js';

const DEFAULT_FILTERS = {
  geo:      'all',
  source:   'all',
  time:     'all',
  q:        '',
  minScore: 0,
  sort:     'rank',
  page:     1,
  limit:    30,
};

export function useJobs() {
  const [jobs,      setJobs]      = useState([]);
  const [stats,     setStats]     = useState(null);
  const [sources,   setSources]   = useState([]);
  const [meta,      setMeta]      = useState({ total: 0, pages: 1, page: 1 });
  const [filters,   setFilters]   = useState(DEFAULT_FILTERS);
  const [loading,   setLoading]   = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [banner,    setBanner]    = useState(null); // { msg, type }
  const abortRef = useRef(null);

  // ── Fetch jobs ──────────────────────────────────────────
  const fetchJobs = useCallback(async (overrides = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const params = { ...filters, ...overrides };
    // Strip 'all' values — backend treats missing as 'all'
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== 'all' && v !== '' && v != null && v !== 0)
    );

    try {
      const data = await api.getJobs(clean);
      if (data.success) {
        setJobs(data.data);
        setMeta(data.meta);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setBanner({ msg: '⚠ Could not reach backend — check your connection', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Fetch stats ─────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      const data = await api.getStats();

      if (data.success) {
        setStats({
          overview: {
            total: data.data.total,
            india: data.data.india,
            remote: data.data.remote,
            today: data.data.today,
            week: data.data.week || 0,
            highScore: data.data.highScore || 0,
            withSalary: data.data.withSalary || 0
          },
          bySrc: data.data.bySrc || [],
          lastRun: data.data.lastRun || null
        });
      }

      const srcData = await api.getSources();

      if (srcData.success) {
        const sourceList = srcData.sources || srcData.data || [];
        setSources(sourceList.map(source => ({
          ...source,
          total: source.total ?? source.count ?? 0
        })));
      }

    } catch (err) {
      console.warn('Stats fetch failed:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Update a single filter ───────────────────────────────
  const setFilter = useCallback((key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      // Reset to page 1 when filter changes
      if (key !== 'page') next.page = 1;
      return next;
    });
  }, []);

  // ── Reset all filters ────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ── Go to page ───────────────────────────────────────────
  const goToPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // ── Auto-fetch when filters change ──────────────────────
  useEffect(() => {
    fetchJobs();
  }, [filters]); // eslint-disable-line

  // ── Fetch stats on mount ─────────────────────────────────
  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  useEffect(() => {
    const interval = setInterval(() => {
      fetchJobs();
      fetchStats();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchJobs, fetchStats]);

  return {
    jobs,
    stats,
    sources,
    meta,
    filters,
    loading,
    statsLoading,
    error,
    banner,
    setBanner,
    setFilter,
    resetFilters,
    goToPage,
    fetchJobs,
    fetchStats,
  };
}

// ── Saved / Applied state (localStorage) ─────────────────
export function useTracker() {
  const [savedIds,   setSavedIds]   = useState(() => new Set(JSON.parse(lsk('saved')   || '[]')));
  const [appliedIds, setAppliedIds] = useState(() => new Set(JSON.parse(lsk('applied') || '[]')));
  const [appData,    setAppData]    = useState(() => JSON.parse(lsk('appdata') || '{}'));
  const [notes,      setNotes]      = useState(() => JSON.parse(lsk('notes')   || '{}'));

  const persist = (saved, applied, data, notesMap) => {
    lss('saved',   JSON.stringify([...saved]));
    lss('applied', JSON.stringify([...applied]));
    lss('appdata', JSON.stringify(data));
    lss('notes',   JSON.stringify(notesMap));
  };

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persist(next, appliedIds, appData, notes);
      return next;
    });
  };

  const markApplied = (id, jobInfo = {}) => {
    setAppliedIds(prev => {
      const next = new Set(prev);
      let nextData = { ...appData };
      if (next.has(id)) {
        next.delete(id);
        delete nextData[id];
      } else {
        next.add(id);
        nextData[id] = {
          status:      'applied',
          appliedDate: new Date().toISOString().split('T')[0],
          recruiter: '', salary: '', followup: '', notes: '',
          title:   jobInfo.title   || '',
          company: jobInfo.company || '',
        };
      }
      setAppData(nextData);
      persist(savedIds, next, nextData, notes);
      return next;
    });
  };

  const updateAppData = (id, updates) => {
    const next = { ...appData, [id]: { ...(appData[id] || {}), ...updates } };
    setAppData(next);
    persist(savedIds, appliedIds, next, notes);
  };

  const saveNote = (id, text) => {
    const next = { ...notes, [id]: text };
    setNotes(next);
    persist(savedIds, appliedIds, appData, next);
  };

  return {
    savedIds, appliedIds, appData, notes,
    toggleSave, markApplied, updateAppData, saveNote,
  };
}
