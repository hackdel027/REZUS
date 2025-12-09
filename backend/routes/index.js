const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/role');
const Log = require("../models/log");
// GET /users — retourne tous les utilisateurs
/**
* @swagger
*tag: Utilisateurs
* /api/users:
*   get:
*     summary: Récupère tous les utilisateurs
*     description: Récupère une liste de tous les utilisateurs enregistrés dans la base de données.
*     responses:
*       200:
*         description: Liste des utilisateurs récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                     description: L'identifiant de l'utilisateur.
*                   nom:
*                     type: string
*                     description: Le nom de l'utilisateur.
*                   prenom:
*                     type: string
*                     description: Le prénom de l'utilisateur.
*                   email:
*                     type: string
*                     description: L'adresse email de l'utilisateur.
*                   role:
*                     type: string
*                     description: Le rôle de l'utilisateur (par exemple, 'admin', 'user').
*       500:
*         description: Erreur serveur lors de la récupération des utilisateurs.
*/
router.get('/users', verifyToken, authorizeRole("admin"), async (req, res) => {
  try {
    const users = await User.find(); // Récupère tous les utilisateurs
    res.json(users); // Renvoie les utilisateurs au format JSON
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /users/:id — récupère un utilisateur par son identifiant
/**
* @swagger
*tag: Utilisateurs
* /api/users/{id}:
*   get:
*     summary: Récupère un utilisateur par son identifiant
*     description: Récupère les détails d'un utilisateur spécifique en utilisant son identifiant.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de l'utilisateur à récupérer.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Utilisateur récupéré avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                   description: L'identifiant de l'utilisateur.
*                 nom:
*                   type: string
*                   description: Le nom de l'utilisateur.
*                 prenom:
*                   type: string
*                   description: Le prénom de l'utilisateur.
*                 email:
*                   type: string
*                   description: L'adresse email de l'utilisateur.
*                 role:
*                   type: string
*                   description: Le rôle de l'utilisateur (par exemple, 'admin', 'user').
*       404:
*         description: Utilisateur non trouvé.
*       500:
*         description: Erreur serveur lors de la récupération de l'utilisateur.
*/ 
router.get('/users/:id', verifyToken, authorizeRole("admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Recherche de l'utilisateur par son _id
    const utilisateur = await User.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(utilisateur); // Renvoie l'utilisateur trouvé
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// GET /profil — récupère le profil de l'utilisateur connecté
/**
* @swagger
* tag: Authentification
* /api/auth/me:
*   get:
*     summary: Récupère le profil de l'utilisateur connecté
*     description: Récupère les détails du profil de l'utilisateur actuellement authentifié en utilisant le token JWT.
*     responses:
*       200:
*         description: Profil utilisateur récupéré avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Message de succès.
*                 user:
*                   type: object
*                   description: Détails de l'utilisateur.
*                   properties:
*                     _id:
*                       type: string
*                       description: L'identifiant de l'utilisateur.
*                     nom:
*                       type: string
*                       description: Le nom de l'utilisateur.
*                     prenom:
*                       type: string
*                     email:
*                       type: string
*                       description: L'adresse email de l'utilisateur.
*                     role:
*                       type: string
*                       description: Le rôle de l'utilisateur (par exemple, 'admin', 'user').
*         404:
*           description: Utilisateur non trouvé.
*         500:
*           description: Erreur serveur lors de la récupération de l'utilisateur.
*/ 
router.get('/profil', verifyToken, async (req, res) => {
  try {
    // L’ID de l’utilisateur est récupéré depuis le token (mis dans req.user)
    const userId = req.user.id;

    // Récupération du profil complet
    const user = await User.findById(userId).select("-password"); 
    // select("-password") pour ne JAMAIS renvoyer le hash du mot de passe

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({
      message: "Profil récupéré avec succès",
      user
    });

  } catch (error) {
    console.error("Erreur /profil :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// GET /logs — récupère les logs d'action (accessible uniquement aux admins)
const authAdmin = [verifyToken, authorizeRole("admin")];
/**
* @swagger
* tag: Logs
* /api/logs:
*   get:
*     summary: Récupère les logs d'action
*     description: Récupère une liste de tous les logs d'action enregistrés dans la base de données. Accessible uniquement aux administrateurs.
*     responses:
*       200:
*         description: Liste des logs récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   userId:
*                     type: string
*                     description: L'identifiant de l'utilisateur ayant effectué l'action.
*                   action:
*                     type: string
*                     description: L'action effectuée.
*                   description:
*                     type: string
*                     description: La description de l'action.
*                   ip:
*                     type: string
*                     description: L'adresse IP de l'utilisateur.
*                   userAgent:
*                     type: string
*                     description: Le user-agent de l'utilisateur.
*                   date:
*                     type: string
*                     format: date-time
*                     description: La date et l'heure de l'action.
*       500:
*         description: Erreur serveur lors de la récupération des logs.
*/
router.get("/logs", authAdmin, async (req, res) => {
    const logs = await Log.find().sort({ date: -1 });
    res.json(logs);
});

module.exports = router;
