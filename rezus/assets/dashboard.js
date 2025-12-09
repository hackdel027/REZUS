(() => {
  // util
  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  async function fetchJson(url){ const token = localStorage.getItem('jwt'); const res = await fetch(url, { headers: token?{ Authorization:`Bearer ${token}` }:{} }); if (!res.ok) return null; return res.json().catch(()=>null); }

  async function loadCountsAndRender() {
    const users = await fetchJson('http://192.168.1.27:3000/api/users') || [];
    const spas = await fetchJson('http://192.168.1.27:3000/api/getspa') || [];
    let perms = await fetchJson('http://192.168.1.27:3000/api/getpermanence');
    if (!perms) perms = await fetchJson('http://192.168.1.27:3000/api/permanences');
    if (!perms) perms = await fetchJson('http://192.168.1.27:3000/api/getpermanences');
    if (!perms) perms = [];

    document.getElementById('countUsers').textContent = users.length || 0;
    document.getElementById('countSPAs').textContent = spas.length || 0;
    document.getElementById('countPermanences').textContent = perms.length || 0;

    renderRecentLists(spas, perms);
    renderSpaBars(spas); // <-- barre horizontale à la place du chart
  }

  function renderRecentLists(spas, perms){
    const recentSpa = (spas || []).slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,6);
    const recentPerm = (perms || []).slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,6);

    const spaEl = document.getElementById('recentSpaList');
    const permEl = document.getElementById('recentPermList');
    if (spaEl) spaEl.innerHTML = recentSpa.length ? recentSpa.map(s => {
      const d = new Date(s.date); return `<li><span>${escapeHtml(d.toLocaleDateString('fr-FR'))}</span><small>${escapeHtml((s.nbre_total||s.presents?.length||0).toString())} agents</small></li>`;
    }).join('') : '<li style="opacity:0.6">Aucune SPA</li>';

    if (permEl) permEl.innerHTML = recentPerm.length ? recentPerm.map(p => {
      const d = new Date(p.date); const names = (p.semaine||[]).filter(x=>x.nom).map(x=>x.nom).slice(0,2).join(', ');
      return `<li><span>${escapeHtml(d.toLocaleDateString('fr-FR'))}</span><small>${escapeHtml(names || '—')}</small></li>`;
    }).join('') : '<li style="opacity:0.6">Aucune permanence</li>';
  }

  // nouvelle fonction : barres horizontales
  function renderSpaBars(spas){
    const container = document.getElementById('spaBars');
    if (!container) return;
    const lastDays = 14;
    const base = new Date(); base.setHours(0,0,0,0);
    const keys = [];
    const labels = [];
    for (let i = lastDays - 1; i >= 0; i--) {
      const d = new Date(base); d.setDate(base.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      keys.push(iso);
      labels.push({ iso, label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) });
    }

    const counts = Object.fromEntries(keys.map(k => [k, 0]));
    (spas || []).forEach(s => {
      try {
        const d = s.date ? new Date(s.date) : null;
        if (!d || isNaN(d.getTime())) return;
        const iso = d.toISOString().slice(0,10);
        if (iso in counts) counts[iso] ++;
      } catch(e){}
    });

    const values = keys.map(k => counts[k] || 0);
    const max = Math.max(1, ...values); // éviter division par 0

    container.innerHTML = labels.map(l => {
      const v = counts[l.iso] || 0;
      const pct = Math.round((v / max) * 100);
      return `
        <div class="spa-bar-row" title="${v} SPA(s) — ${l.label}">
          <div class="spa-bar-label">${escapeHtml(l.label)}</div>
          <div class="spa-bar-track"><div class="spa-bar-fill" style="width:${pct}%;"></div></div>
          <div class="spa-bar-count">${v}</div>
        </div>
      `;
    }).join('');
  }

  async function initDashboard(){
    document.getElementById('btnRefreshDashboard')?.addEventListener('click', loadCountsAndRender);
    await loadCountsAndRender();
  }

  window.initDashboard = initDashboard;
})();