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
    
    // Stocker les données utilisateur pour la modification
    window.currentUser = user;
    
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
    console.log('=== editProfile appelé ===');
    console.trace(); // Affiche la trace d'appel
    
    if (!window.currentUser) {
        alert('Erreur: données utilisateur non disponibles');
        return;
    }
    
    const user = window.currentUser;
    
    // Créer le modal
    const modalHTML = `
        <div class="edit-modal-overlay" id="editModalOverlay">
            <div class="edit-modal">
                <div class="edit-modal-header">
                    <h2>✏️ Modifier mon profil</h2>
                    <button class="close-modal-btn" onclick="closeEditModal()">✕</button>
                </div>
                <div class="edit-modal-body">
                    <form id="editProfileForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editNom">Nom complet *</label>
                                <input type="text" id="editNom" name="nom" value="${user.nom || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPseudo">Pseudo *</label>
                                <input type="text" id="editPseudo" name="pseudo" value="${user.pseudo || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editEmail">Email *</label>
                                <input type="email" id="editEmail" name="email" value="${user.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editTel">Téléphone</label>
                                <input type="tel" id="editTel" name="tel" value="${user.tel || ''}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editAge">Âge</label>
                                <input type="text" id="editAge" name="age" value="${user.age || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editLieu">Lieu</label>
                                <input type="text" id="editLieu" name="lieu" value="${user.lieu || ''}">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-cancel" onclick="closeEditModal()">Annuler</button>
                            <button type="submit" class="btn btn-save">💾 Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Ajouter l'écouteur d'événement au formulaire
    document.getElementById('editProfileForm').addEventListener('submit', handleEditSubmit);
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    const modal = document.getElementById('editModalOverlay');
    if (modal) {
        modal.remove();
    }
    // Réactiver le scroll du body
    document.body.style.overflow = '';
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nom: form.nom.value.trim(),
        pseudo: form.pseudo.value.trim(),
        email: form.email.value.trim(),
        tel: form.tel.value.trim(),
        age: form.age.value.trim(),
        lieu: form.lieu.value.trim()
    };
    
    console.log('Données à envoyer:', formData);
    
    try {
        const token = getAuthToken();
        
        if (!token) {
            throw new Error('Token non trouvé');
        }
        
        // Afficher un loader dans le modal
        const saveBtn = form.querySelector('.btn-save');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '⏳ Enregistrement...';
        saveBtn.disabled = true;
        
        const response = await fetch('http://192.168.1.27:3000/api/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la mise à jour');
        }
        
        console.log('Profil mis à jour avec succès:', data);
        
        // Fermer le modal
        closeEditModal();
        
        // Afficher un message de succès
        showSuccessMessage('✅ Profil mis à jour avec succès !');
        
        // Recharger le profil
        await loadUserProfile();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur: ' + error.message);
        
        // Restaurer le bouton
        const saveBtn = form.querySelector('.btn-save');
        saveBtn.innerHTML = '💾 Enregistrer';
        saveBtn.disabled = false;
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('jwt');
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
window.closeEditModal = closeEditModal;
window.logout = logout;

console.log('✅ Script profile.js chargé et prêt');
console.log('window.initProfile existe?', typeof window.initProfile === 'function');

// Appeler initProfile automatiquement si le container existe
if (document.querySelector('.profile-container')) {
    console.log('Container profil trouvé, appel automatique de initProfile');
    initProfile();
}