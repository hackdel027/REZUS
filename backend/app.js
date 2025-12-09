const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const indexRoutes = require('./routes/index'); // importe les routes (adapter le chemin si nécessaire)
const userRoutes = require('./routes/users');
const permanenceRoutes = require('./routes/permanences'); // routes pour les permanences
const spaRoutes = require('./routes/spa'); // routes pour SPA, si nécessaire
const punitionRoutes = require('./routes/punition'); // routes pour les punitions
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const rateLimit = require('express-rate-limit');
const path = require('path');

// securiser les routes avec un rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes, veuillez réessayer plus tard.",
  standardHeaders: 'draft-8',
	legacyHeaders: false, // désactiver les en-têtes `X-RateLimit-*` pour éviter la confusion
});

const app = express();

//  Middleware
app.use(cors()); // autoriser les requêtes cross-origin si besoin
app.use(express.json()); // pour lire les données JSON dans le corps des requêtes
app.use(express.urlencoded({ extended: true }));
// Connexion à MongoDB
mongoose.connect('mongodb://192.168.1.27:27017/optirh')
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB :', err));

// middleware pour Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// middleware pour le limiter

app.use(limiter);
// Routes
app.use('/api', indexRoutes); // toutes les routes commencent par /api
app.use('/api', spaRoutes); // routes pour SPA
app.use('/api', permanenceRoutes); // routes pour les permanences
app.use('/api', punitionRoutes); // routes pour les punitions
app.use('/api', userRoutes); // routes pour les utilisateurs

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
