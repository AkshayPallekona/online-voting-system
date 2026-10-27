document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('electionsList');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading elections...</div>';
  try {
    const data = await api.apiRequest('/api/elections');
    if (data.elections.length === 0) {
      container.innerHTML = '<div class="empty-state">No elections available.</div>';
      return;
    }
    container.innerHTML = data.elections.map(e => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${e.title}</h5>
          <p class="card-text">${e.description || ''}</p>
          <p><strong>Status:</strong> ${e.status}</p>
          <p><strong>Start:</strong> ${new Date(e.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> ${new Date(e.end_time).toLocaleString()}</p>
          <a href="/election-details.html?id=${e.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
});
