document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('stats');
  if (statsEl) {
    try {
      const data = await api.apiRequest('/api/admin/dashboard');
      statsEl.innerHTML = `
        <div class="row">
          <div class="col-md-3"><div class="card"><div class="card-body"><h5>${data.stats.voters}</h5><p>Voters</p></div></div></div>
          <div class="col-md-3"><div class="card"><div class="card-body"><h5>${data.stats.elections}</h5><p>Elections</p></div></div></div>
          <div class="col-md-3"><div class="card"><div class="card-body"><h5>${data.stats.activeElections}</h5><p>Active</p></div></div></div>
          <div class="col-md-3"><div class="card"><div class="card-body"><h5>${data.stats.totalVotes}</h5><p>Total Votes</p></div></div></div>
        </div>
      `;
    } catch (err) {
      statsEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }

  const elecForm = document.getElementById('electionForm');
  if (elecForm) {
    elecForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(elecForm);
      const data = Object.fromEntries(fd);
      const msg = document.getElementById('formMessage');
      try {
        await api.apiRequest('/api/elections', { method: 'POST', body: JSON.stringify(data) });
        msg.className = 'alert alert-success';
        msg.textContent = 'Election created';
        elecForm.reset();
      } catch (err) {
        msg.className = 'alert alert-danger';
        msg.textContent = err.message;
      }
    });
  }

  const candForm = document.getElementById('candidateForm');
  if (candForm) {
    candForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(candForm);
      const electionId = fd.get('election_id');
      const msg = document.getElementById('formMessage');
      try {
        await api.apiFormRequest(`/api/elections/${electionId}/candidates`, fd);
        msg.className = 'alert alert-success';
        msg.textContent = 'Candidate added';
        candForm.reset();
      } catch (err) {
        msg.className = 'alert alert-danger';
        msg.textContent = err.message;
      }
    });
  }

  const votersEl = document.getElementById('votersList');
  if (votersEl) {
    try {
      const data = await api.apiRequest('/api/admin/voters');
      votersEl.innerHTML = data.voters.map(v => `
        <tr>
          <td>${v.full_name}</td>
          <td>${v.email}</td>
          <td>${v.is_active ? 'Active' : 'Disabled'}</td>
          <td>
            <button class="btn btn-sm ${v.is_active ? 'btn-warning' : 'btn-success'}" 
                    onclick="toggleVoter(${v.id}, ${!v.is_active})">
              ${v.is_active ? 'Disable' : 'Enable'}
            </button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      votersEl.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
    }
  }
});

async function toggleVoter(id, is_active) {
  try {
    await api.apiRequest(`/api/admin/voters/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active })
    });
    location.reload();
  } catch (err) {
    alert(err.message);
  }
}
window.toggleVoter = toggleVoter;
