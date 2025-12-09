(() => {
  let agents = [];

  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function fetchAgents() {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('http://192.168.1.23:3000/api/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Erreur ' + res.status);
      agents = await res.json();
      renderTable(agents);
    } catch (err) {
      console.error('fetchAgents', err);
      const tbody = document.querySelector('#agentsTable tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444">Impossible de charger les agents.</td></tr>`;
    }
  }

  function renderTable(list) {
    const tbody = document.querySelector('#agentsTable tbody');
    const empty = document.getElementById('agentsEmpty');
    if (!tbody) return;
    if (!list || list.length === 0) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = list.map(u => `
      <tr data-id="${escapeHtml(u._id || u.id || '')}">
        <td>${escapeHtml(u.pseudo || u.username || u.nom || '—')}</td>
        <td>${escapeHtml(u.nom || '')}</td>
        <td>${escapeHtml(u.email || '—')}</td>
        <td>${escapeHtml(u.role || '—')}</td>
        <td style="text-align:right">
          <button class="action-btn btn-view" data-action="view">VoirE</button>
          <button class="action-btn btn-edit" data-action="edit">Modifier</button>
          <button class="action-btn btn-delete" data-action="delete">Sppr</button>
        </td>
      </tr>
    `).join('');
  }

  function filterAgents(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(u => {
      return (u.pseudo || u.nom || u.email || '').toLowerCase().includes(q);
    });
  }
function formatDateFr(date) {
    if (!date) return "—"; // si null / undefined

    const d = new Date(date);
    if (isNaN(d.getTime())) return "—"; // si date invalide

    const datePart = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(d);

    const timePart = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(d);

    return `${datePart} à ${timePart}`;
}

  // view details (uses cached agents when possible)
  async function viewAgent(id) {
    const modal = document.getElementById('agentModal');
    const body = document.getElementById('agentModalBody');
    const title = document.getElementById('agentModalTitle');
    if (!modal || !body || !title) return;

    title.textContent = 'Chargement...';
    body.innerHTML = '';

    // try cached
    let agent = agents.find(a => (a._id || a.id) === id);
    if (!agent) {
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`http://192.168.1.27:3000/api/users/${encodeURIComponent(id)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.ok) agent = await res.json();
      } catch (e) { console.error('viewAgent', e); }
    }

    if (!agent) {
      title.textContent = 'Agent introuvable';
      body.innerHTML = `<p class="hint">Impossible de récupérer les informations.</p>`;
    } else {
      title.textContent = agent.pseudo || agent.nom || 'Détails agent';
      body.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
          <div style="width:72px;height:72px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-weight:700;color:#6b7280">${escapeHtml((agent.pseudo||'').charAt(0).toUpperCase())}</div>
          <div>
            <div style="font-weight:700;font-size:16px">${escapeHtml(agent.pseudo || agent.nom || '')}</div>
            <div class="small" style="color:#6b7280">${escapeHtml(agent.email || '')}</div>
          </div>
        </div>

        <div class="detail-section" style="padding:0">
          <h3 style="margin-bottom:8px">Infos</h3>
          <ul style="list-style:none;padding:0;margin:0">
            <li style="padding:8px 0;border-top:1px solid #f1f5f9"><strong>Nom complet:</strong> ${escapeHtml( agent.nom || '—')}</li>
            <li style="padding:8px 0;border-top:1px solid #f1f5f9"><strong>Rôle:</strong> ${escapeHtml(agent.role || '—')}</li>
            <li style="padding:8px 0;border-top:1px solid #f1f5f9"><strong>Téléphone:</strong> ${escapeHtml(agent.tel || '—')}</li>
            <li style="padding:8px 0;border-top:1px solid #f1f5f9"><strong>Dernière connexion:</strong> ${escapeHtml(formatDateFr(agent.lastLogin) || '—')}</li>
          </ul>
        </div>
      `;
    }

    modal.style.display = 'flex';
  }

  // --- nouvelle fonctionnalité : modifier un agent ---
  async function openEditModal(id) {
    const modal = document.getElementById('agentModal');
    const body = document.getElementById('agentModalBody');
    const title = document.getElementById('agentModalTitle');
    if (!modal || !body || !title) return;

    title.textContent = 'Chargement...';
    body.innerHTML = '';

    // retrieve agent from cache or API
    let agent = agents.find(a => (a._id || a.id) === id);
    if (!agent) {
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`http://192.168.1.27:3000/api/users/${encodeURIComponent(id)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.ok) agent = await res.json();
      } catch (e) { console.error('openEditModal', e); }
    }

    if (!agent) {
      title.textContent = 'Agent introuvable';
      body.innerHTML = `<p class="hint">Impossible de récupérer les informations.</p>`;
      modal.style.display = 'flex';
      return;
    }

    title.textContent = 'Modifier l\'agent';
    body.innerHTML = `
      <form id="agentEditForm" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <label style="flex:1;min-width:160px"><div class="small">Pseudo</div><input name="pseudo" value="${escapeHtml(agent.pseudo || '')}" style="width:100%;padding:8px;border:1px solid #e6e9ef;border-radius:8px"></label>
          <label style="flex:1;min-width:160px"><div class="small">Nom complet</div><input name="nom" value="${escapeHtml(agent.nom || '')}" style="width:100%;padding:8px;border:1px solid #e6e9ef;border-radius:8px"></label>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <label style="flex:1;min-width:160px"><div class="small">Email</div><input name="email" type="email" value="${escapeHtml(agent.email || '')}" style="width:100%;padding:8px;border:1px solid #e6e9ef;border-radius:8px"></label>
          <label style="flex:1;min-width:160px"><div class="small">Téléphone</div><input name="tel" value="${escapeHtml(agent.tel || '')}" style="width:100%;padding:8px;border:1px solid #e6e9ef;border-radius:8px"></label>
        </div>
        <div>
          <label><div class="small">Rôle</div>
            <select name="role" style="width:160px;padding:8px;border:1px solid #e6e9ef;border-radius:8px">
              <option value="user" ${agent.role==='agent'?'selected':''}>agent</option>
              <option value="admin" ${agent.role==='admin'?'selected':''}>admin</option>
            </select>
          </label>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
          <button type="button" id="cancelEditAgent" class="btn-secondary">Annuler</button>
          <button type="submit" class="action-btn btn-edit">Enregistrer</button>
        </div>
      </form>
    `;

    // handle cancel
    document.getElementById('cancelEditAgent')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // submit handler
    const form = document.getElementById('agentEditForm');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        pseudo: String(fd.get('pseudo') || '').trim(),
        nom: String(fd.get('nom') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        tel: String(fd.get('tel') || '').trim(),
        role: String(fd.get('role') || '').trim()
      };

      try {
        // try candidate endpoints (use PUT /users/:id as requested, with fallbacks)
        const token = localStorage.getItem('jwt');
        const candidates = [
          `http://192.168.1.27:3000/users/${encodeURIComponent(id)}`,
          `http://192.168.1.27:3000/api/users/${encodeURIComponent(id)}`,
          `/api/users/${encodeURIComponent(id)}`,
          `/users/${encodeURIComponent(id)}`
        ];
        let ok = false;
        let lastErr = null;
        for (const url of candidates) {
          try {
            const res = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type':'application/json', ...(token?{ Authorization:`Bearer ${token}` }:{}) },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const updated = await res.json().catch(()=>null);
              // update local cache
              agents = agents.map(a => ((a._id || a.id) === id ? Object.assign({}, a, updated || payload) : a));
              renderTable(agents);
              modal.style.display = 'none';
              ok = true;
              break;
            } else {
              lastErr = new Error(`HTTP ${res.status} ${res.statusText} from ${url}`);
            }
          } catch (err) {
            lastErr = err;
          }
        }
        if (!ok) throw lastErr || new Error('Échec mise à jour');
        alert('Agent mis à jour');
      } catch (err) {
        console.error('save agent', err);
        alert('Erreur lors de la mise à jour : ' + (err.message || 'erreur'));
      }
    });

    modal.style.display = 'flex';
  }

  async function deleteAgent(id, rowEl) {
    if (!confirm('Confirmez-vous la suppression de cet agent ?')) return;
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`http://192.168.1.27:3000/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(txt || `Erreur ${res.status}`);
      }

      // retirer du tableau local + UI
      agents = agents.filter(a => (a._id || a.id) !== id);
      if (rowEl && rowEl.parentNode) rowEl.parentNode.removeChild(rowEl);
      // si plus de lignes -> afficher hint
      const tbody = document.querySelector('#agentsTable tbody');
      if (tbody && tbody.children.length === 0) document.getElementById('agentsEmpty').style.display = 'block';
    } catch (err) {
      console.error('deleteAgent', err);
      alert('Erreur suppression: ' + (err.message || 'erreur'));
    }
  }

  function attachTableHandlers() {
    const table = document.getElementById('agentsTable');
    if (!table) return;
    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const tr = btn.closest('tr');
      const id = tr?.dataset?.id;
      const action = btn.dataset.action;
      if (!id || !action) return;

      if (action === 'view') viewAgent(id);
      if (action === 'edit') openEditModal(id);
      if (action === 'delete') deleteAgent(id, tr);
    });

    // modal close
    document.getElementById('closeAgentModal')?.addEventListener('click', () => {
      document.getElementById('agentModal').style.display = 'none';
    });
    document.getElementById('modalCloseBtn')?.addEventListener('click', () => {
      document.getElementById('agentModal').style.display = 'none';
    });
  }

  function attachSearch() {
    const input = document.getElementById('agentSearch');
    const btnRefresh = document.getElementById('btnRefreshAgents');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const filtered = filterAgents(e.target.value);
      renderTable(filtered);
    });
    if (btnRefresh) btnRefresh.addEventListener('click', fetchAgents);
  }

  async function initAfficherAgent() {
    attachTableHandlers();
    attachSearch();
    await fetchAgents();
  }

  window.initAfficherAgent = initAfficherAgent;
})();