// src/utils/helpers.js

export function timeDiff(d) {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  if (isNaN(ms)) return '';
  const s = Math.round(ms / 1000);
  if (s < 60)  return s + 's ago';
  const m = Math.round(s / 60);
  if (m < 60)  return m + 'm ago';
  const h = Math.round(m / 60);
  if (h < 24)  return h + 'h ago';
  const dy = Math.round(h / 24);
  return dy === 1 ? '1d ago' : dy + 'd ago';
}

export function freshBadge(d) {
  if (!d) return null;
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 3_600_000)  return { label: '🔥 Just posted', cls: 'hot' };
  if (ms < 86_400_000) return { label: '● New',         cls: 'new' };
  return null;
}

export function formatDate(d) {
  if (!d) return 'Unknown';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function scoreClass(score) {
  if (score >= 70) return 'score-hi';
  if (score >= 45) return 'score-med';
  return 'score-lo';
}

export function sourceBadgeClass(src) {
  const map = {
    greenhouse: 'gh', lever: 'lv', ashby: 'ash',
    adzuna: 'az', remotive: 'rm', google_jobs: 'gj',
  };
  return map[src] || 'loc';
}

export function sourceLabel(src) {
  const map = {
    greenhouse: 'GH', lever: 'LV', ashby: 'ASH',
    adzuna: 'Adzuna', remotive: 'Remote', google_jobs: 'Google',
  };
  return map[src] || src;
}

export function sourceFullName(src) {
  const map = {
    greenhouse: 'Greenhouse', lever: 'Lever', ashby: 'Ashby',
    adzuna: 'Adzuna', remotive: 'Remotive', google_jobs: 'Google Jobs',
  };
  return map[src] || src;
}

export function geoBadgeClass(geo) {
  const map = { india: 'india', remote: 'remote', worldwide: 'world' };
  return map[geo] || 'loc';
}

export function geoLabel(geo) {
  const map = { india: '🇮🇳 India', remote: '🌐 Remote', worldwide: '🌍 Worldwide' };
  return map[geo] || geo;
}

export function lsk(k) { return localStorage.getItem('jc_' + k); }
export function lss(k, v) { localStorage.setItem('jc_' + k, v); }

export function safeJson(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}
