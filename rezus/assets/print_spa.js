// Supprimer le DOMContentLoaded car il ne se déclenche pas lors du chargement dynamique
// document.addEventListener('DOMContentLoaded', function() {
//     initSPA();
// });

async function initSPA() {
    console.log('initSPA appelé');
    // Afficher la date actuelle
    displayCurrentDate();
    
    // Charger la liste des SPAs
    await loadSPAList();
}

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('fr-FR', options);
    }
}

function getAuthToken() {
    return localStorage.getItem('jwt');
}

async function loadSPAList() {
    console.log('loadSPAList appelé');
    try {
        const token = getAuthToken();
        
        if (!token) {
            throw new Error('Token non trouvé. Veuillez vous reconnecter.');
        }
        
        console.log('Envoi requête API...');
        const response = await fetch('http://192.168.1.27:3000/api/getspa', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Réponse reçue:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expiré ou invalide
                localStorage.removeItem('jwt');
                localStorage.removeItem('token');
                window.location.href = './pages/login.html';
                return;
            }
            throw new Error('Erreur lors du chargement des données');
        }
        
        const spas = await response.json();
        console.log('SPAs chargées:', spas.length);
        displaySPAList(spas);
    } catch (error) {
        console.error('Erreur:', error);
        // Afficher un message d'erreur
        displayError('Impossible de charger les données SPA: ' + error.message);
    }
}

function displaySPAList(spas) {
    console.log('displaySPAList appelé');
    const container = document.querySelector('.spa-container');
    if (!container) {
        console.error('Container .spa-container non trouvé');
        return;
    }
    
    if (!spas || spas.length === 0) {
        container.innerHTML = `
            <div class="spa-header">
                <h1>CONSULTER LA SPA</h1>
                <div class="date-display" id="currentDate"></div>
            </div>
            <div class="empty-message" style="text-align: center; padding: 40px; font-size: 1.2em; color: #999;">
                Aucune donnée SPA disponible
            </div>
        `;
        displayCurrentDate();
        return;
    }
    
    // Trier les SPAs par date décroissante
    spas.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = `
        <div class="spa-header">
            <h1>CONSULTER LA SPA</h1>
            <div class="date-display" id="currentDate"></div>
        </div>
        
        <div class="spa-list-section">
            <h2 style="margin-bottom: 20px; color: #333;">Historique des présences</h2>
            <div class="spa-cards-grid">
                ${spas.map(spa => `
                    <div class="spa-card" data-spa-id="${spa._id}" onclick="viewSPADetail('${spa._id}')">
                        <div class="spa-card-header">
                            <span class="spa-card-date">📅 ${formatDate(spa.date)}</span>
                        </div>
                        <div class="spa-card-stats">
                            <div class="spa-card-stat">
                                <span class="stat-label">Total</span>
                                <span class="stat-value total-color">${spa.nbre_total || 0}</span>
                            </div>
                            <div class="spa-card-stat">
                                <span class="stat-label">Présents</span>
                                <span class="stat-value present-color">${spa.nbre_present || 0}</span>
                            </div>
                            <div class="spa-card-stat">
                                <span class="stat-label">Absents</span>
                                <span class="stat-value absent-color">${spa.nbre_absent || 0}</span>
                            </div>
                        </div>
                        <button class="view-detail-btn">Voir les détails →</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    displayCurrentDate();
    console.log('Affichage terminé');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

async function viewSPADetail(spaId) {
    console.log('viewSPADetail appelé pour:', spaId);
    try {
        const token = getAuthToken();
        
        if (!token) {
            throw new Error('Token non trouvé.');
        }
        
        const response = await fetch(`http://192.168.1.27:3000/api/getspa/${spaId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails');
        }
        
        const spa = await response.json();
        displaySPADetail(spa);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de charger les détails de cette SPA');
    }
}

function displaySPADetail(data) {
    const container = document.querySelector('.spa-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="spa-header">
            <h1>CONSULTER LA SPA</h1>
            <div class="date-display">${formatDate(data.date)}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card total">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>Total</h3>
                    <p class="stat-number">${data.nbre_total || 0}</p>
                </div>
            </div>

            <div class="stat-card present">
                <div class="stat-icon">✓</div>
                <div class="stat-info">
                    <h3>Présents</h3>
                    <p class="stat-number">${data.nbre_present || 0}</p>
                </div>
            </div>

            <div class="stat-card absent">
                <div class="stat-icon">✗</div>
                <div class="stat-info">
                    <h3>Absents</h3>
                    <p class="stat-number">${data.nbre_absent || 0}</p>
                </div>
            </div>
        </div>

        <div class="details-section">
            <!-- Section Absents -->
            <div class="detail-card">
                <h2 class="section-title absent-title">
                    <span class="icon">✗</span> Absents
                </h2>
                <div class="list-container">
                    ${displayAbsentsHTML(data.absents || [])}
                </div>
            </div>

            <!-- Section Retardataires -->
            <div class="detail-card">
                <h2 class="section-title retard-title">
                    <span class="icon">⏰</span> Retardataires
                </h2>
                <div class="list-container">
                    ${displayRetardatairesHTML(data.retardataires || [])}
                </div>
            </div>

            <!-- Section Permissionnaires -->
            <div class="detail-card">
                <h2 class="section-title permission-title">
                    <span class="icon">📝</span> Permissionnaires
                </h2>
                <div class="list-container">
                    ${displayPermissionnairesHTML(data.permissionnaires || [])}
                </div>
            </div>

            <!-- Section Présents -->
            <div class="detail-card">
                <h2 class="section-title present-title">
                    <span class="icon">✓</span> Présents
                </h2>
                <div class="list-container">
                    ${displayPresentsHTML(data.presents || [])}
                </div>
            </div>
        </div>

        <div style="text-align: center; margin: 30px 0; padding-bottom: 100px;">
            <button class="back-btn" onclick="initSPA()">← Retour à la liste</button>
        </div>
    `;
}

function displayAbsentsHTML(absents) {
    if (absents.length === 0) {
        return '<p class="empty-message">Aucun absent</p>';
    }
    
    return absents.map(absent => `
        <div class="list-item absent">
            <span class="item-name">${absent.nom}</span>
            <span class="item-detail">${absent.motif || '-'}</span>
        </div>
    `).join('');
}

function displayRetardatairesHTML(retardataires) {
    if (retardataires.length === 0) {
        return '<p class="empty-message">Aucun retardataire</p>';
    }
    
    return retardataires.map(retard => `
        <div class="list-item retard">
            <span class="item-name">${retard.nom}</span>
            <span class="item-detail">Arrivée: ${retard.heure_arrivee || '-'}</span>
        </div>
    `).join('');
}

function displayPermissionnairesHTML(permissionnaires) {
    if (permissionnaires.length === 0) {
        return '<p class="empty-message">Aucun permissionnaire</p>';
    }
    
    return permissionnaires.map(perm => `
        <div class="list-item permission">
            <span class="item-name">${perm.nom}</span>
            <span class="item-detail">${perm.motif || '-'}</span>
        </div>
    `).join('');
}

function displayPresentsHTML(presents) {
    if (presents.length === 0) {
        return '<p class="empty-message">Aucune donnée</p>';
    }
    
    return presents.map(present => `
        <div class="list-item present">
            <span class="item-name">${present}</span>
        </div>
    `).join('');
}

function displayError(message) {
    const container = document.querySelector('.spa-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="spa-header">
            <h1>Section de Présence et Absence (SPA)</h1>
            <div class="date-display" id="currentDate"></div>
        </div>
        <div class="error-message" style="text-align: center; padding: 40px; color: #ee0979; background: #fff5f5; border: 2px solid #ee0979; border-radius: 10px; margin: 20px;">
            <h2>⚠️ Erreur</h2>
            <p>${message}</p>
        </div>
    `;
    displayCurrentDate();
}

// Rendre les fonctions globales pour onclick
window.viewSPADetail = viewSPADetail;
window.initSPA = initSPA;

console.log('Script print_spa.js chargé et prêt');

// Appeler initSPA automatiquement si le container existe
if (document.querySelector('.spa-container')) {
    console.log('Container trouvé, appel automatique de initSPA');
    initSPA();
}