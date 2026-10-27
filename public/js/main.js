document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await api.apiRequest('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Check auth status for nav
  try {
    const data = await api.apiRequest('/api/auth/me', { skipCsrf: true });
    const nav = document.getElementById('userNav');
    if (nav && data.user) {
      nav.innerHTML = `
        <span class="nav-link">Hello, ${data.user.full_name}</span>
        <a class="nav-link" href="${data.user.role === 'admin' ? '/admin-dashboard.html' : '/voter-dashboard.html'}">Dashboard</a>
        <a class="nav-link" href="#" id="logoutBtn">Logout</a>
      `;
      document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await api.apiRequest('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
      });
    }
  } catch (e) {
    // Not logged in
  }
});
