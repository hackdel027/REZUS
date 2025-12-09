(() => {
  const dayNames = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  let users = [];

  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function isoDate(d){ return d.toISOString().split('T')[0]; }
  function readableDate(d){ return d.toLocaleDateString('fr-FR',{weekday:'short', day:'2-digit', month:'short', year:'numeric'}); }

  async function fetchUsers(){
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('http://192.168.1.27:3000/api/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Erreur /api/users ' + res.status);
      users = await res.json();
    } catch (err) {
      console.error('fetchUsers', err);
      users = [];
    }
  }

  function computeWeekDates(mondayIso){
    const start = new Date(mondayIso);
    const arr = [];
    for (let i=0;i<7;i++){ const d = new Date(start); d.setDate(start.getDate()+i); arr.push(d); }
    return arr;
  }

  function buildSelectOptions(){
    if (!users || users.length === 0) return '<option value="">— Aucun utilisateur —</option>';
    return ['<option value="">— Choisir personne —</option>']
      .concat(users.map(u => `<option value="${escapeHtml(u.pseudo || u.nom || u.email || '')}">${escapeHtml(u.pseudo || u.nom || u.email || '')}</option>`))
      .join('');
  }

  function buildDayCard(idx, date){
    return `
      <div class="day-card" data-index="${idx}">
        <div class="day-title">${escapeHtml(dayNames[idx])}</div>
        <div class="day-date">${escapeHtml(readableDate(date))}</div>
        <select class="person-select" data-day="${idx}">
          ${buildSelectOptions()}
        </select>
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

  function collectForm(){
    const cards = Array.from(document.querySelectorAll('.day-card'));
    return cards.map(c => {
      const nom = (c.querySelector('.person-select')?.value || '').trim();
      const date = c.querySelector('.day-date-input')?.value || '';
      return { nom, date };
    });
  }

  function updatePreview(){
    const previewEl = document.getElementById('preview');
    if (!previewEl) return;
    const data = collectForm();
    const assigned = data.filter(d => d.nom);
    if (assigned.length === 0) {
      previewEl.innerHTML = '<h3>Aperçu</h3><ul><li style="opacity:0.6">Aucune personne assignée</li></ul>';
      return;
    }
    const list = assigned.map(d => `<li>${escapeHtml(d.nom)} — ${escapeHtml(new Date(d.date).toLocaleDateString('fr-FR'))}</li>`).join('');
    previewEl.innerHTML = `<h3>Aperçu</h3><ul>${list}</ul>`;
  }

  async function savePermanence(){
    const payload = { semaine: collectForm() };
    if (!payload.semaine.some(s => s.nom)) { alert('Veuillez assigner au moins une personne.'); return; }

    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('http://localhost:3000/api/createPermanence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok) {
        alert('Plan de permanence enregistré.');
      } else {
        alert(`Erreur: ${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error('savePermanence', err);
      alert('Erreur réseau.');
    }
  }

  // init called after page injection
  async function initPlanPerm(){
    await fetchUsers();

    // default monday = nearest Monday
    const weekStart = document.getElementById('weekStart');
    const btnGen = document.getElementById('btnGenerate');
    const btnPreview = document.getElementById('btnPreview');
    const btnSave = document.getElementById('btnSave');

    if (!weekStart) return;
    const today = new Date();
    const d = (today.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(today); monday.setDate(today.getDate() - d);
    weekStart.value = isoDate(monday);

    // initial render
    renderWeek(weekStart.value);
    updatePreview();

    // regenerate when clicking Générer
    if (btnGen) btnGen.addEventListener('click', () => { renderWeek(weekStart.value); updatePreview(); });

    // delegated change to update preview live when selects change
    const daysGrid = document.getElementById('daysGrid');
    if (daysGrid) daysGrid.addEventListener('change', () => updatePreview());

    if (btnPreview) btnPreview.addEventListener('click', updatePreview);
    if (btnSave) btnSave.addEventListener('click', savePermanence);
  }

  window.initPlanPerm = initPlanPerm;
})();