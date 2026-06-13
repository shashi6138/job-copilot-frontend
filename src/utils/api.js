// src/utils/api.js

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  // Jobs
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return req(`/api/jobs${qs ? '?' + qs : ''}`);
  },
  getJob:     (id)     => req(`/api/jobs/${id}`),
  searchJobs: (params) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/jobs/search?${qs}`);
  },
  // Stats + sources
  getStats:   ()       => req('/api/jobs/stats/summary'),
  getSources: ()       => req('/api/jobs/sources'),
  // Health
  health:     ()       => req('/health'),
  // Manual scrape (admin)
  triggerScrape: (apiKey) =>
    req('/api/jobs/scrape', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
    }),
};

export default api;
