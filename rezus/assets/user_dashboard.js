document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const navItems = document.querySelectorAll('.nav-item');

    // Fonction pour charger une page
    function loadPage(pageName) {
        console.log('Chargement de la page:', pageName);
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
                
                // Attendre que le DOM soit mis à jour
                setTimeout(() => {
                    // Charger le script spécifique si nécessaire
                    if (pageName === 'spa') {
                        console.log('Chargement du script SPA');
                        loadScript('assets/print_spa.js', () => {
                            if (typeof window.initSPA === 'function') {
                                window.initSPA();
                            }
                        });
                    } else if (pageName === 'profile') {
                        console.log('Chargement du script profil');
                        loadScript('assets/profile.js', () => {
                            console.log('Script profile.js chargé, vérification de initProfile');
                            if (typeof window.initProfile === 'function') {
                                console.log('Appel de initProfile');
                                window.initProfile();
                            } else {
                                console.error('initProfile non définie');
                            }
                        });
                    } else if (pageName === 'permanence') {
                        console.log('Page permanence chargée');
                    }
                }, 100);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la page:', error);
                contentDiv.innerHTML = `<h2>Erreur</h2><p>${error.message}</p>`;
            });
    }

    // Fonction pour charger un script dynamiquement
    function loadScript(src, callback) {
        console.log('loadScript appelé pour:', src);
        const existingScript = document.querySelector(`script[src="${src}"]`);
        
        // Si le script existe déjà, appeler directement le callback
        if (existingScript) {
            console.log('Script déjà chargé, appel du callback');
            if (callback) {
                callback();
            }
            return;
        }
        
        // Sinon, charger le nouveau script
        console.log('Création d\'un nouveau script:', src);
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log('Script chargé avec succès:', src);
            if (callback) callback();
        };
        script.onerror = () => {
            console.error('Erreur lors du chargement du script:', src);
        };
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
            console.log('Clic sur navigation:', page);
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
    console.log('Chargement de la page initiale:', initialPage);
    loadPage(initialPage);
});