let csrfToken = '';

async function fetchCsrf() {
  const res = await fetch('/api/auth/csrf');
  const data = await res.json();
  csrfToken = data.csrfToken;
}

async function apiRequest(url, options = {}) {
  if (!csrfToken && !options.skipCsrf) {
    await fetchCsrf();
  }
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (!options.skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
    headers['x-csrf-token'] = csrfToken;
  }
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function apiFormRequest(url, formData) {
  if (!csrfToken) await fetchCsrf();
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: { 'x-csrf-token': csrfToken },
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

window.api = { apiRequest, apiFormRequest, fetchCsrf };
