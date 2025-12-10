async function initProfile() {
    console.log('initProfile appelé');
    showLoader(true);
    await loadUserProfile();
}

function showLoader(show) {
    const loader = document.getElementById('profileLoader');
    console.log('Loader element:', loader);
    if (loader) {
        if (show) {
            loader.classList.add('active');
        } else {
            loader.classList.remove('active');
        }
    }
}

function getAuthToken() {
    const token = localStorage.getItem('jwt');
    console.log('Token récupéré:', token ? 'Présent' : 'Absent');
    return token;
}

async function loadUserProfile() {
    console.log('=== DEBUT loadUserProfile ===');
    try {
        const token = getAuthToken();
        
        if (!token) {
            console.error('Token manquant!');
            throw new Error('Token non trouvé. Veuillez vous reconnecter.');
        }
        
        console.log('Envoi de la requête vers: http://192.168.1.27:3000/api/profil');
        const response = await fetch('http://192.168.1.27:3000/api/profil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Réponse HTTP status:', response.status);
        console.log('Réponse HTTP ok:', response.ok);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Erreur 401 - Token invalide ou expiré');
                localStorage.removeItem('jwt');
                localStorage.removeItem('token');
                window.location.href = './pages/login.html';
                return;
            }
            const errorText = await response.text();
            console.error('Erreur API:', errorText);
            throw new Error('Erreur lors du chargement du profil');
        }
        
        const data = await response.json();
        console.log('=== Données reçues ===');
        console.log('data complète:', data);
        console.log('data.user:', data.user);
        
        // L'API retourne { message: '...', user: {...} }
        // On passe uniquement data.user à displayUserProfile
        if (data.user) {
            displayUserProfile(data.user);
        } else {
            throw new Error('Données utilisateur manquantes dans la réponse');
        }
    } catch (error) {
        console.error('=== ERREUR dans loadUserProfile ===');
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        displayError('Impossible de charger le profil: ' + error.message);
    } finally {
        console.log('=== Finally block ===');
        showLoader(false);
    }
}

function displayUserProfile(user) {
    console.log('=== DEBUT displayUserProfile ===');
    console.log('User object:', user);
    
    // Mettre à jour l'avatar avec les initiales
    const avatarEl = document.getElementById('avatarInitials');
    console.log('Element avatarInitials:', avatarEl);
    if (avatarEl && user.nom) {
        const initials = user.nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        console.log('Initiales calculées:', initials);
        avatarEl.textContent = initials;
    }
    
    // Informations personnelles
    console.log('Mise à jour des informations personnelles...');
    updateElement('userName', user.nom);
    updateElement('userPseudo', user.pseudo);
    updateElement('userAge', user.age);
    updateElement('userLieu', user.lieu);
    
    // Contact
    console.log('Mise à jour des informations de contact...');
    updateElement('userEmail', user.email);
    updateElement('userTel', user.tel);
    
    // Professionnel
    console.log('Mise à jour des informations professionnelles...');
    const roleEl = document.getElementById('userRole');
    console.log('Element userRole:', roleEl);
    if (roleEl && user.role) {
        roleEl.textContent = user.role;
        roleEl.classList.add(user.role);
        console.log('Rôle défini:', user.role);
    }
    
    updateElement('userPole', user.pole);
    
    // Dates
    console.log('Mise à jour des dates...');
    if (user.date_inscription) {
        updateElement('userDateInscription', formatDate(user.date_inscription));
    }
    
    if (user.lastLogin) {
        updateElement('userLastLogin', formatDate(user.lastLogin));
    } else {
        updateElement('userLastLogin', 'Première connexion');
    }
    
    console.log('=== FIN displayUserProfile ===');
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    console.log(`Mise à jour de ${id}:`, element, 'avec valeur:', value);
    if (element) {
        element.textContent = value || '-';
    } else {
        console.warn(`Élément ${id} non trouvé`);
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

function editProfile() {
    alert('Fonctionnalité de modification en cours de développement');
    // TODO: Implémenter le formulaire de modification
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        window.location.href = './pages/login.html';
    }
}

function displayError(message) {
    console.error('Affichage erreur:', message);
    const container = document.querySelector('.profile-container');
    if (!container) {
        console.error('Container profile-container non trouvé');
        return;
    }
    
    container.innerHTML = `
        <div class="profile-header">
            <h1>Mon Profil</h1>
        </div>
        <div class="error-message" style="text-align: center; padding: 40px; color: #ee0979; background: #fff5f5; border: 2px solid #ee0979; border-radius: 10px; margin: 20px;">
            <h2>⚠️ Erreur</h2>
            <p>${message}</p>
        </div>
    `;
}

// Rendre les fonctions globales
window.initProfile = initProfile;
window.editProfile = editProfile;
window.logout = logout;

console.log('✅ Script profile.js chargé et prêt');
console.log('window.initProfile existe?', typeof window.initProfile === 'function');

// Appeler initProfile automatiquement si le container existe
if (document.querySelector('.profile-container')) {
    console.log('Container profil trouvé, appel automatique de initProfile');
    initProfile();
}