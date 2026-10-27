document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<div class="loading">Loading results...</div>';

  try {
    const data = await api.apiRequest(`/api/elections/${id}/results`);
    if (data.results.length === 0) {
      container.innerHTML = '<div class="empty-state">No votes recorded yet.</div>';
      return;
    }

    let html = '<h4>Vote Totals</h4><ul class="list-group mb-4">';
    data.results.forEach(r => {
      html += `<li class="list-group-item d-flex justify-content-between">
        <span>${r.name} (${r.party_name || 'Independent'})</span>
        <span>${r.votes} votes (${r.percentage || 0}%)</span>
      </li>`;
    });
    html += `</ul><p><strong>Total Votes:</strong> ${data.totalVotes}</p><canvas id="resultsChart"></canvas>`;
    container.innerHTML = html;

    const ctx = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.results.map(r => r.name),
        datasets: [{
          label: 'Votes',
          data: data.results.map(r => r.votes),
          backgroundColor: '#0d6efd'
        }]
      },
      options: { responsive: true }
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
});
