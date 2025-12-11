(() => {
  const dayNames = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  let users = [];

  function escapeHtml(s=''){ 
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); 
  }
  
  function isoDate(d){ 
    return d.toISOString().split('T')[0]; 
  }
  
  function readableDate(d){ 
    return d.toLocaleDateString('fr-FR',{weekday:'short', day:'2-digit', month:'short', year:'numeric'}); 
  }

  async function fetchUsers(){
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Token manquant');
      
      const res = await fetch('http://192.168.1.27:3000/api/users', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error('Erreur /api/users ' + res.status);
      users = await res.json();
      console.log('Utilisateurs chargés:', users.length);
      
      // Remplir le select coordinateur
      populateCoordinatorSelect();
    } catch (err) {
      console.error('fetchUsers', err);
      users = [];
      alert('Erreur lors du chargement des utilisateurs: ' + err.message);
    }
  }

  function populateCoordinatorSelect(){
    const coordSelect = document.getElementById('coordinatorSelect');
    if (!coordSelect) return;
    
    const options = users.map(u => 
      `<option value="${escapeHtml(u._id || u.id || '')}">${escapeHtml(u.pseudo || u.nom || u.email || '?')}</option>`
    ).join('');
    
    coordSelect.innerHTML = '<option value="">— Sélectionner un coordinateur —</option>' + options;
  }

  function computeWeekDates(mondayIso){
    const start = new Date(mondayIso);
    const arr = [];
    for (let i=0; i<7; i++){ 
      const d = new Date(start); 
      d.setDate(start.getDate()+i); 
      arr.push(d); 
    }
    return arr;
  }

  function buildAgentSelectOptions(){
    if (!users || users.length === 0) return '<option value="">— Aucun agent —</option>';
    return ['<option value="">— Choisir un agent —</option>']
      .concat(users.map(u => 
        `<option value="${escapeHtml(u._id || u.id || '')}">${escapeHtml(u.pseudo || u.nom || u.email || '?')}</option>`
      ))
      .join('');
  }

  function buildDayCard(idx, date){
    return `
      <div class="day-card" data-index="${idx}">
        <div class="day-title">${escapeHtml(dayNames[idx])}</div>
        <div class="day-date">${escapeHtml(readableDate(date))}</div>
        <label class="agents-label">3 Agents de permanence :</label>
        <div class="agent-selects">
          <select class="agent-select" data-day="${idx}" data-agent="0">
            ${buildAgentSelectOptions()}
          </select>
          <select class="agent-select" data-day="${idx}" data-agent="1">
            ${buildAgentSelectOptions()}
          </select>
          <select class="agent-select" data-day="${idx}" data-agent="2">
            ${buildAgentSelectOptions()}
          </select>
        </div>
        <input type="hidden" class="day-date-input" value="${isoDate(date)}">
      </div>
    `;
  }

  function renderWeek(mondayIso){
    const daysGrid = document.getElementById('daysGrid');
    const weekLabel = document.getElementById('weekLabel');
    if (!daysGrid || !weekLabel) return;
    
    const dates = computeWeekDates(mondayIso);
    weekLabel.textContent = `Semaine du ${dates[0].toLocaleDateString('fr-FR')} au ${dates[6].toLocaleDateString('fr-FR')}`;
    daysGrid.innerHTML = dates.map((d,i)=> buildDayCard(i,d)).join('');
  }

  function collectFormData(){
    const coordinatorId = document.getElementById('coordinatorSelect')?.value;
    if (!coordinatorId) {
      alert('⚠️ Veuillez sélectionner un coordinateur');
      return null;
    }

    const cards = Array.from(document.querySelectorAll('.day-card'));
    const jours = cards.map(card => {
      const idx = parseInt(card.dataset.index);
      const date = card.querySelector('.day-date-input')?.value;
      const selects = card.querySelectorAll('.agent-select');
      const agents = Array.from(selects).map(s => s.value).filter(v => v);
      
      if (agents.length !== 3) {
        return null; // Invalid
      }
      
      return {
        nom: dayNames[idx],
        date: date,
        agents: agents
      };
    });

    // Vérifier que tous les jours ont 3 agents
    if (jours.some(j => j === null)) {
      alert('⚠️ Chaque jour doit avoir exactement 3 agents');
      return null;
    }

    return {
      semaine: {
        coordinateur: coordinatorId,
        jours: jours
      }
    };
  }

  function updatePreview(){
    const previewEl = document.getElementById('preview');
    if (!previewEl) return;
    
    const coordSelect = document.getElementById('coordinatorSelect');
    const coordText = coordSelect?.selectedOptions[0]?.text || 'Non sélectionné';
    
    const cards = Array.from(document.querySelectorAll('.day-card'));
    
    let html = `<h3>Aperçu de la planification</h3>`;
    html += `<div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px;">
      <strong>👨‍💼 Coordinateur:</strong> ${escapeHtml(coordText)}
    </div>`;
    
    cards.forEach(card => {
      const idx = parseInt(card.dataset.index);
      const selects = card.querySelectorAll('.agent-select');
      const agents = Array.from(selects)
        .map(s => s.selectedOptions[0]?.text)
        .filter(t => t && t !== '— Choisir un agent —');
      
      if (agents.length > 0) {
        html += `<div class="day-group">
          <span class="day-group-title">${dayNames[idx]}</span>
          <ul style="margin: 0; padding-left: 20px;">
            ${agents.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>
        </div>`;
      }
    });
    
    previewEl.innerHTML = html;
  }

  async function savePermanence(){
    const payload = collectFormData();
    if (!payload) return;

    console.log('Payload à envoyer:', payload);

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Token manquant');
      
      const btnSave = document.getElementById('btnSave');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '⏳ Enregistrement...';
      }
      
      const res = await fetch('http://192.168.1.27:3000/api/createPermanence', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('✅ Plan de permanence enregistré avec succès !');
        // Réinitialiser le formulaire
        document.getElementById('coordinatorSelect').value = '';
        renderWeek(document.getElementById('weekStart').value);
        updatePreview();
      } else {
        throw new Error(data.message || `Erreur ${res.status}`);
      }
    } catch (err) {
      console.error('savePermanence', err);
      alert('❌ Erreur: ' + err.message);
    } finally {
      const btnSave = document.getElementById('btnSave');
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '💾 Enregistrer';
      }
    }
  }

  async function initPlanPerm(){
    console.log('initPlanPerm appelé');
    
    await fetchUsers();

    const weekStart = document.getElementById('weekStart');
    const btnGen = document.getElementById('btnGenerate');
    const btnPreview = document.getElementById('btnPreview');
    const btnSave = document.getElementById('btnSave');

    if (!weekStart) {
      console.error('Element weekStart non trouvé');
      return;
    }
    
    // Calculer le lundi de cette semaine
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    weekStart.value = isoDate(monday);

    // Rendu initial
    renderWeek(weekStart.value);
    updatePreview();

    // Événements
    if (btnGen) {
      btnGen.addEventListener('click', () => { 
        renderWeek(weekStart.value); 
        updatePreview(); 
      });
    }

    // Écouteur pour les changements de sélection
    const daysGrid = document.getElementById('daysGrid');
    if (daysGrid) {
      daysGrid.addEventListener('change', () => updatePreview());
    }
    
    // Écouteur pour le coordinateur
    const coordSelect = document.getElementById('coordinatorSelect');
    if (coordSelect) {
      coordSelect.addEventListener('change', () => updatePreview());
    }

    if (btnPreview) btnPreview.addEventListener('click', updatePreview);
    if (btnSave) btnSave.addEventListener('click', savePermanence);
    
    console.log('initPlanPerm terminé');
  }

  window.initPlanPerm = initPlanPerm;
})();