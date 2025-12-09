document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la page SPA
    initSPA();
});

async function initSPA() {
    // Afficher la date actuelle
    displayCurrentDate();
    
    // Charger les données SPA
    await loadSPAData();
}

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('fr-FR', options);
    }
}

async function loadSPAData() {
    try {
        // Remplacer par votre endpoint API
        const response = await fetch('/api/spa/today');
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des données');
        }
        
        const data = await response.json();
        displaySPAData(data);
    } catch (error) {
        console.error('Erreur:', error);
        // Afficher des données de test en cas d'erreur
        displaySPAData(getTestData());
    }
}

function displaySPAData(data) {
    // Mettre à jour les statistiques
    updateStats(data);
    
    // Afficher les listes
    displayAbsents(data.absents || []);
    displayRetardataires(data.retardataires || []);
    displayPermissionnaires(data.permissionnaires || []);
    displayPresents(data.presents || []);
}

function updateStats(data) {
    const nbreTotalEl = document.getElementById('nbreTotal');
    const nbrePresentEl = document.getElementById('nbrePresent');
    const nbreAbsentEl = document.getElementById('nbreAbsent');
    
    if (nbreTotalEl) nbreTotalEl.textContent = data.nbre_total || 0;
    if (nbrePresentEl) nbrePresentEl.textContent = data.nbre_present || 0;
    if (nbreAbsentEl) nbreAbsentEl.textContent = data.nbre_absent || 0;
}

function displayAbsents(absents) {
    const container = document.getElementById('absentsList');
    if (!container) return;
    
    if (absents.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucun absent</p>';
        return;
    }
    
    container.innerHTML = absents.map(absent => `
        <div class="list-item absent">
            <span class="item-name">${absent.nom}</span>
            <span class="item-detail">${absent.motif || '-'}</span>
        </div>
    `).join('');
}

function displayRetardataires(retardataires) {
    const container = document.getElementById('retardatairesList');
    if (!container) return;
    
    if (retardataires.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucun retardataire</p>';
        return;
    }
    
    container.innerHTML = retardataires.map(retard => `
        <div class="list-item retard">
            <span class="item-name">${retard.nom}</span>
            <span class="item-detail">Arrivée: ${retard.heure_arrivee || '-'}</span>
        </div>
    `).join('');
}

function displayPermissionnaires(permissionnaires) {
    const container = document.getElementById('permissionnairesList');
    if (!container) return;
    
    if (permissionnaires.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucun permissionnaire</p>';
        return;
    }
    
    container.innerHTML = permissionnaires.map(perm => `
        <div class="list-item permission">
            <span class="item-name">${perm.nom}</span>
            <span class="item-detail">${perm.motif || '-'}</span>
        </div>
    `).join('');
}

function displayPresents(presents) {
    const container = document.getElementById('presentsList');
    if (!container) return;
    
    if (presents.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune donnée</p>';
        return;
    }
    
    container.innerHTML = presents.map(present => `
        <div class="list-item present">
            <span class="item-name">${present}</span>
        </div>
    `).join('');
}

// Données de test
function getTestData() {
    return {
        date: new Date(),
        nbre_total: 50,
        nbre_present: 42,
        nbre_absent: 8,
        absents: [
            { nom: "Jean Dupont", motif: "Maladie" },
            { nom: "Marie Martin", motif: "Congé" },
            { nom: "Pierre Durand", motif: "-" }
        ],
        retardataires: [
            { nom: "Sophie Bernard", heure_arrivee: "08:15" },
            { nom: "Luc Petit", heure_arrivee: "08:30" }
        ],
        permissionnaires: [
            { nom: "Alice Leroy", motif: "RDV médical" },
            { nom: "Thomas Moreau", motif: "Démarches administratives" }
        ],
        presents: [
            "Paul Laurent", "Claire Simon", "Marc Dubois", "Emma Roux",
            "Hugo Fournier", "Léa Girard", "Jules Bonnet", "Chloé Lambert"
        ]
    };
}