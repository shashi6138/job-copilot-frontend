// src/utils/api.js

const BASE = import.meta.env.VITE_API_URL || window?.location?.origin || 'http://localhost:3001';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    cache: 'no-store',
    ...opts,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `API ${res.status}: ${res.statusText}`);
  }
  return data;
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
  triggerScrape: (apiKey) => {
    const key = apiKey.trim();
    return req('/api/jobs/scrape', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ apiKey: key }),
    });
  },
};

export default api;
