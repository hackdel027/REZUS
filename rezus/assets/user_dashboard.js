document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const navItems = document.querySelectorAll('.nav-item');

    // Fonction pour charger une page
    function loadPage(pageName) {
        fetch(`pages/${pageName}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Page non trouvée');
                }
                return response.text();
            })
            .then(html => {
                contentDiv.innerHTML = html;
                updateActiveNav(pageName);
                
                // Charger le script spécifique si nécessaire
                if (pageName === 'spa') {
                    loadScript('assets/print_spa.js');
                }
            })
            .catch(error => {
                contentDiv.innerHTML = `<h2>Erreur</h2><p>${error.message}</p>`;
            });
    }

    // Fonction pour charger un script dynamiquement
    function loadScript(src) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = src;
        document.body.appendChild(script);
    }

    // Fonction pour mettre à jour la navigation active
    function updateActiveNav(pageName) {
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    // Ajouter des écouteurs d'événements aux éléments de navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            loadPage(page);
            
            // Mettre à jour l'URL sans recharger la page
            history.pushState({ page }, '', `#${page}`);
        });
    });

    // Gérer le bouton retour du navigateur
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            loadPage(e.state.page);
        }
    });

    // Charger la page initiale
    const initialPage = window.location.hash.substring(1) || 'spa';
    loadPage(initialPage);
});