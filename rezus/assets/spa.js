// Chargé globalement depuis index.html. Appelle window.initSPA() après injection du fragment.
(() => {
  let agents = [];
  let initialized = false;

  async function loadAgentsFromApi() {
    const token = localStorage.getItem('jwt');
    const res = await fetch('http://192.168.1.27:3000/api/users', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error(`API /api/users error ${res.status}`);
    const data = await res.json();
    agents = data.map(u => ({
      _id: u._id,
      pseudo: u.pseudo || `${u.nom || ''}`.trim() || u.email || 'unknown',
      status: 'present',
      motifPermission: '',
      heureArrivee: ''
    }));
  }

  function renderTable() {
    const tbody = document.getElementById('agentsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    agents.forEach((agent, i) => {
      const tr = document.createElement('tr');
      tr.dataset.index = i;
      tr.innerHTML = `
        <td><strong>${escapeHtml(agent.pseudo)}</strong></td>
        <td><input type="checkbox" class="status-check" data-status="present" ${agent.status === 'present' ? 'checked' : ''}></td>
        <td><input type="checkbox" class="status-check" data-status="absent" ${agent.status === 'absent' ? 'checked' : ''}></td>
        <td><input type="checkbox" class="status-check" data-status="permission" ${agent.status === 'permission' ? 'checked' : ''}></td>
        <td><input type="text" class="motif-input" data-motif="permission" placeholder="Motif" value="${escapeHtml(agent.motifPermission)}" ${agent.status === 'permission' ? '' : 'disabled'}></td>
        <td><input type="checkbox" class="status-check" data-status="sick" ${agent.status === 'sick' ? 'checked' : ''}></td>
        <td><input type="checkbox" class="status-check" data-status="late" ${agent.status === 'late' ? 'checked' : ''}></td>
        <td><input type="time" class="heure-input" placeholder="HH:MM" value="${escapeHtml(agent.heureArrivee)}" ${agent.status === 'late' ? '' : 'disabled'}></td>
      `;
      tbody.appendChild(tr);
    });

    updateSummary();
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  // event delegation on tbody for checkboxes and motif inputs
  function attachDelegatedListeners() {
    const tbody = document.getElementById('agentsTableBody');
    if (!tbody) return;

    tbody.addEventListener('change', (e) => {
      const el = e.target;
      const row = el.closest('tr');
      if (!row) return;
      const index = parseInt(row.dataset.index, 10);

      if (el.classList.contains('status-check')) {
        const status = el.dataset.status;
        if (el.checked) {
          // uncheck other status checkboxes in same row
          row.querySelectorAll('.status-check').forEach(cb => {
            if (cb !== el) cb.checked = false;
          });
          agents[index].status = status;
        } else {
          // if unchecked, default to present
          row.querySelector('.status-check[data-status="present"]').checked = true;
          agents[index].status = 'present';
        }
        
        const permissionInput = row.querySelector('.motif-input[data-motif="permission"]');
        const heureInput = row.querySelector('.heure-input');
        
        if (agents[index].status === 'permission') {
          permissionInput.disabled = false;
          permissionInput.focus();
          heureInput.disabled = true;
          heureInput.value = '';
          agents[index].heureArrivee = '';
        } else if (agents[index].status === 'late') {
          heureInput.disabled = false;
          heureInput.focus();
          permissionInput.disabled = true;
          permissionInput.value = '';
          agents[index].motifPermission = '';
        } else {
          permissionInput.disabled = true;
          heureInput.disabled = true;
          permissionInput.value = '';
          heureInput.value = '';
          agents[index].motifPermission = '';
          agents[index].heureArrivee = '';
        }
        updateSummary();
      }
    });

    // input event for motif inputs
    tbody.addEventListener('input', (e) => {
      const el = e.target;
      const row = el.closest('tr');
      const index = parseInt(row.dataset.index, 10);
      
      if (el.classList.contains('motif-input')) {
        agents[index].motifPermission = el.value;
      } else if (el.classList.contains('heure-input')) {
        agents[index].heureArrivee = el.value;
      }
    });
  }

  function updateSummary() {
    const counts = { present: 0, absent: 0, permission: 0, sick: 0, late: 0 };
    agents.forEach(a => { counts[a.status || 'present'] = (counts[a.status || 'present'] || 0) + 1; });
    
    // Les retardataires comptent comme présents
    const countPresentsTotal = counts.present + counts.late;
    
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('countPresents', countPresentsTotal);
    set('countAbsents', counts.absent);
    set('countPermissions', counts.permission);
    set('countSick', counts.sick);
    set('countLate', counts.late);
  }

  function attachControlListeners() {
    const btnValidate = document.getElementById('btnValidateSPA');
    if (btnValidate) {
      btnValidate.addEventListener('click', submitSPA);
    }
    const btnReset = document.getElementById('btnResetSPA');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        agents.forEach(a => { a.status = 'present'; a.motifPermission = ''; a.heureArrivee = ''; });
        renderTable();
      });
    }
  }

  async function submitSPA() {
    try {
      const date = new Date().toISOString();
      const nbre_total = agents.length;
      const presents = [];
      const absents = [];
      const permissionnaires = [];
      const retardataires = [];

      agents.forEach(a => {
        const status = a.status || 'present';
        if (status === 'present') {
          presents.push(a.pseudo);
        } else if (status === 'absent') {
          absents.push({ nom: a.pseudo, motif: '-' });
        } else if (status === 'permission') {
          permissionnaires.push({ nom: a.pseudo, motif: a.motifPermission || '-' });
        } else if (status === 'late') {
          retardataires.push({ nom: a.pseudo, heure_arrivee: a.heureArrivee || '-' });
        }
      });

      const nbre_present = presents.length + retardataires.length;
      const nbre_absent = absents.length;

      const payload = {
        date,
        nbre_total,
        nbre_present,
        nbre_absent,
        absents,
        retardataires,
        permissionnaires,
        presents
      };

      const token = localStorage.getItem('jwt');
      const res = await fetch('http://192.168.1.27:3000/api/createspa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('SPA enregistrée avec succès');
        agents.forEach(a => { a.status = 'present'; a.motifPermission = ''; a.heureArrivee = ''; });
        renderTable();
      } else {
        alert(`Erreur: ${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error('submitSPA error', err);
      alert('Erreur de connexion au serveur');
    }
  }

  // fonction d'initialisation appelée après injection du fragment
  async function initSPA() {
    try {
      await loadAgentsFromApi();
      renderTable();

      // afficher la date du jour dans le header
      const dateEl = document.getElementById('spa-date');
      if (dateEl) {
        const today = new Date();
        // format lisible : Samedi 28 novembre 2025 ou selon locale
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formatted = today.toLocaleDateString('fr-FR', opts);
        dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }

      if (!initialized) {
        attachDelegatedListeners();
        attachControlListeners();
        initialized = true;
      }
    } catch (err) {
      console.error('initSPA error', err);
      alert('Impossible de charger la liste des agents');
    }
  }

  // expose pour que app.js appelle initSPA() après injection de la vue
  window.initSPA = initSPA;
})();