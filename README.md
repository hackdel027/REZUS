# REZUS - Système de Gestion de Présence et d'Agents

## 📋 Description

REZUS est une application web de gestion de présence et d'agents développée avec une architecture moderne de Single Page Application (SPA). Elle permet de gérer efficacement les présences, absences, retards et permissions du personnel ainsi que la gestion complète des agents.

## ✨ Fonctionnalités Principales

### 🔐 Authentification et Sécurité
- Système d'authentification JWT (JSON Web Token)
- Protection des routes et des API
- Gestion des sessions utilisateur
- Redirection automatique en cas de token expiré

### 👥 Gestion des Agents
- **Liste complète des agents** avec tableau interactif
- **Recherche en temps réel** par pseudo, nom, email ou rôle
- **Affichage détaillé** des informations d'un agent :
  - Pseudo et nom complet
  - Email et téléphone
  - Rôle (agent/admin)
  - Date de création et dernière mise à jour
- **Modification des agents** :
  - Édition des informations personnelles
  - Changement de rôle
  - Interface modale intuitive
- **Suppression d'agents** avec confirmation

### 📊 Section SPA (Présence et Absence)
- **Tableau de bord statistique** :
  - Nombre total d'agents
  - Nombre de présents
  - Nombre d'absents
- **Gestion des absents** :
  - Liste détaillée avec motifs
  - Indicateur visuel par couleur
- **Gestion des retardataires** :
  - Liste avec heure d'arrivée
  - Suivi en temps réel
- **Gestion des permissionnaires** :
  - Liste avec motifs de permission
  - Suivi des autorisations
- **Liste des présents** :
  - Vue complète du personnel présent
- **Affichage de la date** en français avec format long

### 📱 Interface Utilisateur
- **Design moderne et responsive**
  - Compatible mobile, tablette et desktop
  - Navigation fluide avec barre de navigation fixe en bas
- **Single Page Application (SPA)**
  - Chargement dynamique des pages sans rechargement
  - Transitions fluides entre les sections
  - Gestion de l'historique du navigateur
- **Trois sections principales** :
  - SPA (Présence et Absence)
  - Permanence
  - Profil

### 🎨 Expérience Utilisateur
- **Indicateurs visuels** :
  - Couleurs distinctes par catégorie (présents, absents, retards, permissions)
  - Icônes intuitives
  - Effets de survol et animations
- **Messages d'état** :
  - Messages d'erreur clairs
  - Confirmations d'actions
  - États de chargement
- **Formulaires optimisés** :
  - Validation côté client
  - Interface modale pour édition
  - Boutons d'action contextuels

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling avec gradients et animations
- **JavaScript ES6+** - Logique applicative
- **Fetch API** - Communication avec le backend

### Backend (Architecture)
- **Node.js** - Runtime
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification

## 📁 Structure du Projet

```
rezus/
├── assets/
│   ├── user_dashboard.js      # Gestion SPA et navigation
│   ├── print_spa.js           # Affichage données SPA
│   └── afficher_agent.js      # Gestion des agents
├── pages/
│   ├── spa.html               # Page Section Présence/Absence
│   ├── permanence.html        # Page Permanence
│   └── profil.html            # Page Profil
├── user_dashboard.html        # Page principale (SPA)
└── README.md                  # Documentation
```

## 🚀 Installation et Configuration

### Prérequis
- Serveur web (Apache/Nginx)
- Node.js et npm
- MongoDB
- Accès SFTP (pour déploiement)

### Installation

1. **Cloner le projet**
```bash
cd /var/www/html
git clone [votre-repo] rezus
```

2. **Configuration SFTP** (VS Code)
```json
{
    "name": "Rezus Server",
    "host": "192.168.1.23",
    "protocol": "sftp",
    "port": 22,
    "username": "votre_utilisateur",
    "remotePath": "/var/www/html/rezus",
    "uploadOnSave": true
}
```

3. **Configuration Backend**
- Configurer MongoDB
- Définir les variables d'environnement (JWT_SECRET, etc.)
- Lancer le serveur Node.js

4. **Accéder à l'application**
```
http://votre-serveur/rezus/user_dashboard.html
```

## 📊 Modèles de Données

### Modèle Agent/Utilisateur
```javascript
{
  pseudo: String,
  nom: String,
  email: String,
  tel: String,
  role: String, // 'agent' ou 'admin'
  password: String, // hashé
  createdAt: Date,
  updatedAt: Date
}
```

### Modèle SPA (Présence)
```javascript
{
  date: Date,
  nbre_total: Number,
  nbre_present: Number,
  nbre_absent: Number,
  absents: [{
    nom: String,
    motif: String
  }],
  retardataires: [{
    nom: String,
    heure_arrivee: String
  }],
  permissionnaires: [{
    nom: String,
    motif: String
  }],
  presents: [String]
}
```

## 🔒 Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Validation des entrées utilisateur
- ✅ Échappement HTML (protection XSS)
- ✅ Gestion des erreurs côté client et serveur
- ✅ Confirmation pour les actions critiques (suppression)
- ✅ Expiration automatique des tokens

## 🎯 Fonctionnalités à Venir

- [ ] Génération de rapports PDF
- [ ] Export Excel des données
- [ ] Notifications en temps réel
- [ ] Historique des modifications
- [ ] Dashboard administrateur avancé
- [ ] Gestion des congés et vacances
- [ ] Module de pointage par QR Code/NFC
- [ ] Statistiques avancées et graphiques
- [ ] Multi-langue (FR/EN)

## 👨‍💻 Développeur

Projet développé pour la gestion interne du personnel.

## 📝 Licence

Propriétaire - Tous droits réservés

## 📞 Support

Pour toute question ou problème, contactez l'administrateur système.

---

**Version:** 1.0.0  
**Dernière mise à jour:** Décembre 2025