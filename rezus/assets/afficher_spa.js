(() => {
  let allSPAs = [];

  async function loadSPAList() {
    try {
      const loading = document.getElementById('spaLoading');
      if (loading) loading.style.display = 'block';

      const token = localStorage.getItem('jwt');
      const res = await fetch('http://192.168.1.27:3000/api/getspa', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      allSPAs = await res.json();

      if (loading) loading.style.display = 'none';
      renderSPAList(allSPAs);
    } catch (err) {
      console.error('loadSPAList error', err);
      alert('Erreur: impossible de charger les SPA');
    }
  }

  function renderSPAList(spas) {
    const container = document.getElementById('spaListContainer');
    if (!container) return;

    if (spas.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">Aucune fiche de présence trouvée.</p>';
      return;
    }

    container.innerHTML = spas.map(spa => {
      const date = new Date(spa.date);
      const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      const formatted = date.toLocaleDateString('fr-FR', opts);
      
      return `
        <div class="spa-box">
          <div class="spa-box-header">
            <div class="spa-box-date">${formatted}</div>
            <div class="spa-box-badge">${spa.nbre_total} agents</div>
          </div>

          <div class="spa-box-stats">
            <div class="spa-stat-item">
              <span class="spa-stat-label">Présents</span>
              <span class="spa-stat-value">${spa.nbre_present || 0}</span>
            </div>
            <div class="spa-stat-item">
              <span class="spa-stat-label">Absents</span>
              <span class="spa-stat-value">${spa.nbre_absent || 0}</span>
            </div>
            <div class="spa-stat-item">
              <span class="spa-stat-label">Permissionnaires</span>
              <span class="spa-stat-value">${(spa.permissionnaires?.length || 0)}</span>
            </div>
            <div class="spa-stat-item">
              <span class="spa-stat-label">Retardataires</span>
              <span class="spa-stat-value">${(spa.retardataires?.length || 0)}</span>
            </div>
          </div>

          <div class="spa-box-footer">
            <button class="btn-view" onclick="showSPADetails('${spa._id}')">Voir détails</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  async function showSPADetails(spaId) {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`http://192.168.1.27:3000/api/getspa/${spaId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const spa = await res.json();

      const date = new Date(spa.date);
      const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formatted = date.toLocaleDateString('fr-FR', opts);

      const modalTitle = document.getElementById('modalTitle');
      if (modalTitle) modalTitle.textContent = `SPA du ${formatted}`;

      const modalBody = document.getElementById('modalBody');
      if (!modalBody) return;

      let html = `
        <div class="modal-section">
          <h3>Résumé</h3>
          <ul>
            <li>Total agents: <strong>${spa.nbre_total}</strong></li>
            <li>Présents: <strong>${spa.nbre_present}</strong></li>
            <li>Absents: <strong>${spa.nbre_absent}</strong></li>
          </ul>
        </div>
      `;

      if (spa.absents && spa.absents.length > 0) {
        html += `
          <div class="modal-section">
            <h3>Absents</h3>
            <ul>
              ${spa.absents.map(a => `<li>${escapeHtml(a.nom)}${a.motif && a.motif !== '-' ? `<small>Motif: ${escapeHtml(a.motif)}</small>` : ''}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (spa.permissionnaires && spa.permissionnaires.length > 0) {
        html += `
          <div class="modal-section">
            <h3>Permissionnaires</h3>
            <ul>
              ${spa.permissionnaires.map(p => `<li>${escapeHtml(p.nom)}${p.motif && p.motif !== '-' ? `<small>Motif: ${escapeHtml(p.motif)}</small>` : ''}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (spa.retardataires && spa.retardataires.length > 0) {
        html += `
          <div class="modal-section">
            <h3>Retardataires</h3>
            <ul>
              ${spa.retardataires.map(r => `<li>${escapeHtml(r.nom)}${r.heure_arrivee && r.heure_arrivee !== '-' ? `<small>Heure arrivée: ${escapeHtml(r.heure_arrivee)}</small>` : ''}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (spa.presents && spa.presents.length > 0) {
        html += `
          <div class="modal-section">
            <h3>Présents</h3>
            <ul>
              ${spa.presents.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      modalBody.innerHTML = html;
      
      // ajouter le bouton imprimer dans le footer
      const modalFooter = document.querySelector('.modal-footer');
      if (modalFooter) {
        modalFooter.innerHTML = `
          <button class="btn-print" onclick="printSPA('${formatted}')">🖨️ Imprimer</button>
          <button class="btn-secondary" onclick="closeSPAModal()">Fermer</button>
        `;
      }

      document.getElementById('spaModal').style.display = 'flex';
      
      // stocker la SPA pour l'impression
      window.currentSPAForPrint = { spa, formatted };
    } catch (err) {
      console.error('showSPADetails error', err);
      alert('Erreur: impossible de charger les détails de la SPA');
    }
  }

  window.printSPA = function(dateFormatted) {
    if (!window.currentSPAForPrint) return;
    
    const { spa, formatted } = window.currentSPAForPrint;
    const logoUrl = `${location.origin}/frontend/assets/logo.jpeg`;
    console.log(`${location.origin}/assets/logo.jpeg`);
     // chemin absolu vers le logo

    let printContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SPA - ${formatted}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; background: white; color: #333; }
          .print-container { max-width: 210mm; margin: 0 auto; background: white; padding: 30px; }
          .print-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2b8aef; padding-bottom: 15px; }
          .print-header img { width: 86px; height: 86px; object-fit: cover; border-radius: 50%; display:block; margin: 0 auto 10px; }
          .print-header h1 { font-size: 28px; color: #0f1724; margin-bottom: 5px; }
          .print-header p { font-size: 14px; color: #6b7280; }
          .print-date { text-align: right; margin-bottom: 20px; font-size: 14px; color: #6b7280; }
          .print-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .summary-box { background: #f8f9fb; padding: 15px; border-radius: 8px; border-left: 4px solid #2b8aef; }
          .summary-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
          .summary-box .value { font-size: 24px; font-weight: 700; color: #2b8aef; margin-top: 8px; }
          .print-section { margin-bottom: 25px; }
          .print-section h2 { font-size: 16px; color: #0f1724; border-bottom: 2px solid #e6e9ef; padding-bottom: 10px; margin-bottom: 12px; }
          .print-section ul { margin-left: 20px; }
          .print-section li { margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
          .print-section small { display: block; color: #6b7280; font-size: 12px; margin-top: 3px; }
          .empty-section { color: #6b7280; font-style: italic; font-size: 13px; }
          @media print {
            body { padding: 0; }
            .print-container { padding: 0; }
          }
          @page { margin: 1cm; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <img src="${logoUrl}" alt="OPTIRH Logo">
            <h1>Fiche de Présence (SPA)</h1>
            <p>Rapport détaillé de présence du personnel</p>
          </div>
          
          <div class="print-date">
            <strong>Date:</strong> ${formatted}
          </div>
          
          <div class="print-summary">
            <div class="summary-box">
              <div class="label">Total Agents</div>
              <div class="value">${spa.nbre_total}</div>
            </div>
            <div class="summary-box">
              <div class="label">Présents</div>
              <div class="value" style="color: #10b981;">${spa.nbre_present}</div>
            </div>
            <div class="summary-box">
              <div class="label">Absents</div>
              <div class="value" style="color: #ef4444;">${spa.nbre_absent}</div>
            </div>
            <div class="summary-box">
              <div class="label">Taux Présence</div>
              <div class="value" style="color: #3b82f6;">${Math.round((spa.nbre_present / Math.max(1, spa.nbre_total)) * 100)}%</div>
            </div>
          </div>

          ${spa.presents && spa.presents.length > 0 ? `
            <div class="print-section">
              <h2>✓ Présents (${spa.presents.length})</h2>
              <ul>
                ${spa.presents.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${spa.absents && spa.absents.length > 0 ? `
            <div class="print-section">
              <h2>✗ Absents (${spa.absents.length})</h2>
              <ul>
                ${spa.absents.map(a => `<li>${escapeHtml(a.nom)}${a.motif && a.motif !== '-' ? `<small>Motif: ${escapeHtml(a.motif)}</small>` : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${spa.permissionnaires && spa.permissionnaires.length > 0 ? `
            <div class="print-section">
              <h2>📄 Permissionnaires (${spa.permissionnaires.length})</h2>
              <ul>
                ${spa.permissionnaires.map(p => `<li>${escapeHtml(p.nom)}${p.motif && p.motif !== '-' ? `<small>Motif: ${escapeHtml(p.motif)}</small>` : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${spa.retardataires && spa.retardataires.length > 0 ? `
            <div class="print-section">
              <h2>⏰ Retardataires (${spa.retardataires.length})</h2>
              <ul>
                ${spa.retardataires.map(r => `<li>${escapeHtml(r.nom)}${r.heure_arrivee && r.heure_arrivee !== '-' ? `<small>Heure arrivée: ${escapeHtml(r.heure_arrivee)}</small>` : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
        
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  window.closeSPAModal = function() {
    document.getElementById('spaModal').style.display = 'none';
  };

  window.showSPADetails = showSPADetails;

  // Recherche
  function attachSearchListener() {
    const searchInput = document.getElementById('searchSPA');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allSPAs.filter(spa => {
          const date = new Date(spa.date).toLocaleDateString('fr-FR');
          return date.toLowerCase().includes(query);
        });
        renderSPAList(filtered);
      });
    }
  }

  // Rafraîchir
  function attachRefreshListener() {
    const btnRefresh = document.getElementById('btnRefreshSPA');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', loadSPAList);
    }
  }

  async function initAfficherSPA() {
    await loadSPAList();
    attachSearchListener();
    attachRefreshListener();
  }

  window.initAfficherSPA = initAfficherSPA;
})();