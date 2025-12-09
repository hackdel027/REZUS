// Ouvre / ferme les sous-menus
function toggleMenu(id) {
    let submenu = document.getElementById(id);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

// Charge un fichier HTML depuis /pages/
async function loadPage(page) {
  const content = document.getElementById('content');

  fetch(`./pages/${page}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Erreur chargement page ' + response.status);
      return response.text();
    })
    .then(html => {
      content.innerHTML = html;
      if (page === 'dashboard' && typeof window.initDashboard === 'function') {
        requestAnimationFrame(() => window.initDashboard());
      }
      if (page === 'plan_perm' && typeof window.initPlanPerm === 'function') {
        requestAnimationFrame(() => window.initPlanPerm());
      }
      if (page === 'add_spa' && typeof window.initSPA === 'function') {
        requestAnimationFrame(() => window.initSPA());
      }
      if (page === 'afficher_spa' && typeof window.initAfficherSPA === 'function') {
        requestAnimationFrame(() => window.initAfficherSPA());
      }
      if (page === 'add_agent' && typeof window.initAddAgent === 'function') {
        requestAnimationFrame(() => window.initAddAgent());
      }
      if (page === 'user_stats' && typeof window.initUserStats === 'function') {
        requestAnimationFrame(() => window.initUserStats());
      }
      if (page === 'afficher_agent' && typeof window.initAfficherAgent === 'function') {
        requestAnimationFrame(() => window.initAfficherAgent());
      }
      if (page === 'logs' && typeof window.initLogs === 'function') {
        requestAnimationFrame(() => window.initLogs());
      }

    })
    .catch(err => console.error('Erreur chargement page:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('jwt');
      // optionnel : clear other storage/data si besoin
      window.location.href = './pages/login.html';
    });
  }
});
