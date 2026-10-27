document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const titleEl = document.getElementById('electionTitle');
  const descEl = document.getElementById('electionDesc');
  const candidatesEl = document.getElementById('candidatesList');
  const voteSection = document.getElementById('voteSection');

  try {
    const elec = await api.apiRequest(`/api/elections/${id}`);
    titleEl.textContent = elec.election.title;
    descEl.textContent = elec.election.description || '';

    const cands = await api.apiRequest(`/api/elections/${id}/candidates`);
    if (cands.candidates.length === 0) {
      candidatesEl.innerHTML = '<div class="empty-state">No candidates yet.</div>';
    } else {
      candidatesEl.innerHTML = cands.candidates.map(c => `
        <div class="card mb-3">
          <div class="card-body d-flex">
            ${c.photo ? `<img src="${c.photo}" class="candidate-photo me-3" alt="${c.name}">` : ''}
            <div>
              <h5>${c.name}</h5>
              <p class="text-muted">${c.party_name || 'Independent'}</p>
              <p>${c.description || ''}</p>
            </div>
          </div>
        </div>
      `).join('');
    }

    const status = await api.apiRequest(`/api/elections/${id}/my-status`).catch(() => ({ hasVoted: false }));
    const now = new Date();
    const start = new Date(elec.election.start_time);
    const end = new Date(elec.election.end_time);
    const canVote = elec.election.status === 'published' && now >= start && now <= end && !status.hasVoted;

    if (canVote && cands.candidates.length > 0) {
      voteSection.innerHTML = `
        <form id="voteForm">
          <div class="mb-3">
            <label class="form-label">Select Candidate</label>
            <select class="form-select" name="candidate_id" required>
              <option value="">Choose...</option>
              ${cands.candidates.map(c => `<option value="${c.id}">${c.name} (${c.party_name || 'Independent'})</option>`).join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-success">Cast Vote</button>
        </form>
        <div id="voteMessage"></div>
      `;
      document.getElementById('voteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to cast this vote? This cannot be undone.')) return;
        const fd = new FormData(e.target);
        const msg = document.getElementById('voteMessage');
        msg.textContent = 'Submitting vote...';
        try {
          await api.apiRequest(`/api/elections/${id}/vote`, {
            method: 'POST',
            body: JSON.stringify({ candidate_id: fd.get('candidate_id') })
          });
          window.location.href = `/vote-confirmation.html?id=${id}`;
        } catch (err) {
          msg.className = 'alert alert-danger';
          msg.textContent = err.message;
        }
      });
    } else if (status.hasVoted) {
      voteSection.innerHTML = '<div class="alert alert-info">You have already voted in this election.</div>';
    } else {
      voteSection.innerHTML = '<div class="alert alert-warning">Voting is not currently open for this election.</div>';
    }
  } catch (err) {
    document.body.innerHTML += `<div class="alert alert-danger">${err.message}</div>`;
  }
});
