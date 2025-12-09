(() => {
  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  const queryInputId = 'statsQuery';
  const resultId = 'statsResult';
  const loadingId = 'statsLoading';

  async function fetchStats(pseudo) {
    const loading = document.getElementById(loadingId);
    const resultEl = document.getElementById(resultId);
    if (!resultEl) return;
    loading.style.display = 'block';
    resultEl.innerHTML = '';

    const token = localStorage.getItem('jwt');
    const url = `http://192.168.1.27:3000/api/stats/${encodeURIComponent(pseudo)}`;

    try {
      console.log('user_stats: requesting', url);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => null);
      renderStats(data);
    } catch (err) {
      console.error('user_stats: fetch error', err);
      resultEl.innerHTML = `<div class="hint">Erreur: ${escapeHtml(err.message || 'Impossible de joindre l\'API')}</div>`;
    } finally {
      loading.style.display = 'none';
    }
  }

  function renderStats(data) {
    const el = document.getElementById(resultId);
    if (!el) return;

    if (!data || typeof data !== 'object') {
      el.innerHTML = `<p class="hint">Aucune donnée pour cet utilisateur.</p>`;
      return;
    }

    // Controller returns: { utilisateur, mois, absences, retards, permissions }
    const user = data.utilisateur || data.nom || '—';
    const mois = data.mois || '';
    const absences = Number(data.absences || 0);
    const retards = Number(data.retards || 0);
    const permissions = Number(data.permissions || 0);

    const totalActions = absences + retards + permissions;

    el.innerHTML = `
      <div class="summary">
        <div class="stat-card"><div class="label">Agent</div><div class="value">${escapeHtml(user)}</div></div>
        <div class="stat-card"><div class="label">Période</div><div class="value">${escapeHtml(mois)}</div></div>
        <div class="stat-card"><div class="label">Total incidents</div><div class="value">${totalActions}</div></div>
      </div>

      <div class="detail-section">
        <h3>Répartition</h3>
        <ul class="detail-list">
          <li><span>Absences</span><small>${absences}</small></li>
          <li><span>Retards</span><small>${retards}</small></li>
          <li><span>Permissions</span><small>${permissions}</small></li>
        </ul>
      </div>
    `;
  }

  function attachHandlers() {
    const btn = document.getElementById('btnSearchStats');
    const input = document.getElementById(queryInputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) { document.getElementById(resultId).innerHTML = '<p class="hint">Saisir un pseudo.</p>'; return; }
      fetchStats(val);
    });
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') btn.click();
    });
  }

  async function initUserStats() {
    attachHandlers();
    // optional: focus input
    const input = document.getElementById(queryInputId);
    if (input) input.focus();
  }

  window.initUserStats = initUserStats;
})();