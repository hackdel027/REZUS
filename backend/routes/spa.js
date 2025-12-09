const spa_model = require('../models/spa')
const express = require('express');
const router = express.Router();
const moment = require('moment');
const verifyToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/role');
const authorizeRoles = require('../middlewares/roles');
const logAction = require("../utils/logger");


// POST /SPA — enregistrer une nouvelle SPA
/**
* @swagger
*tag: SPA
* /api/createspa:
*   post:
*     summary: Enregistre une nouvelle fiche SPA
*     description: Enregistre une nouvelle fiche SPA avec les détails fournis dans le corps de la requête.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               nbre_total:
*                 type: integer
*                 description: Le nombre total de personnes.
*               nbre_present:
*                 type: integer
*                 description: Le nombre de personnes présentes.
*               nbre_absent:
*                 type: integer
*                 description: Le nombre de personnes absentes.
*               absents:
*                 type: array
*                 items:
*                   type: string
*                 description: Liste des personnes absentes.
*               retardataires:
*                 type: array
*                 items:
*                   type: string
*                 description: Liste des personnes retardataires.
*               permissionnaires:
*                 type: array
*                 items:
*                   type: string
*                 description: Liste des personnes en permission.
*               presents:
*                 type: array
*                 items:
*                   type: string
*                 description: Liste des personnes présentes.
*     responses:
*       201:
*         description: Fiche SPA enregistrée avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Message de succès.
*                 fiche:
*                   type: object
*                   description: Détails de la fiche SPA enregistrée.
*       500:
*         description: Erreur lors de la sauvegarde de la fiche SPA.
*/
router.post('/createspa', verifyToken, async (req, res) => {
  try {
    const {
      nbre_total,
      nbre_present,
      nbre_absent,
      absents,
      retardataires,
      permissionnaires,
      presents,
    } = req.body;

    const nouvelleFiche = new spa_model({
      nbre_total,
      nbre_present,
      nbre_absent,
      absents,
      retardataires,
      permissionnaires,
      presents,
    });

    await nouvelleFiche.save();
    await logAction(req, "AJOUT_SPA", "Une nouvelle fiche SPA a été créée.");
    res.status(201).json({ message: 'Fiche enregistrée avec succès', fiche: nouvelleFiche });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la sauvegarde', error: err.message });
  }
});

// GET recupere toutes les SPA presentent dans la BD et envoie les id.
/**
* @swagger
*tag: SPA
* /api/getspa:
*   get:
*     summary: Récupère toutes les fiches SPA
*     description: Récupère une liste de toutes les fiches SPA enregistrées dans la base de données.
*     responses:
*       200:
*         description: Liste des fiches SPA récupérées avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                     description: L'identifiant de la fiche SPA.
*                   date:
*                     type: string
*                     format: date-time
*                     description: La date de la fiche SPA.
*       500:
*         description: Erreur serveur lors de la récupération des fiches SPA.
*/  
router.get('/getspa', verifyToken, async function (req, res) {
  try {
    const fiches = await spa_model.find().sort({ date: -1 }); // sélectionne uniquement le champ "_id"
   // const ids = fiches.map(f => f._id); // ou f._id.toString() si tu veux des chaînes
    res.json(fiches);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// GET /getspa/:id — récupère une fiche SPA par son identifiant
/**
* @swagger
*tag: SPA
* /api/getspa/{id}:
*   get:
*     summary: Récupère une fiche SPA par son identifiant
*     description: Récupère les détails d'une fiche SPA spécifique en utilisant son identifiant.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de la fiche SPA à récupérer.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Fiche SPA récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                   description: L'identifiant de la fiche SPA.
*                 date:
*                   type: string
*                   format: date-time
*                   description: La date de la fiche SPA.
*       404:
*         description: Fiche SPA non trouvée.
*       500:
*         description: Erreur serveur lors de la récupération de la fiche SPA.
*/
router.get('/getspa/:id', verifyToken, async (req, res) => {
  try {
    const fiche = await spa_model.findById(req.params.id);
    if (!fiche) {
      return res.status(404).json({ message: "Fiche non trouvée" });
    }
    res.json(fiche);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


/* 
  GET /stats - recuperer les statistiques
  d'un utilisateur. Son nombre d'absence , de retard,
  de permission au cours du mois
*/

/**
* @swagger
*tag: Statistiques
* /api/stats/{id}:
*   get:
*     summary: Récupère les statistiques d'un utilisateur
*     description: Récupère le nombre d'absences, de retards et de permissions d'un utilisateur pour le mois en cours.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de l'utilisateur.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Statistiques récupérées avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 absences:
*                   type: integer
*                 retards:
*                   type: integer
*                 permissions:
*                   type: integer
*       404:
*         description: Utilisateur non trouvé.
*       500:
*         description: Erreur serveur lors de la récupération des statistiques.
*/
router.get('/stats/:nom', verifyToken, async (req, res) => {
  const { nom } = req.params;
  const nomClean = String(nom || '').trim().toLowerCase();

  // Obtenir la date de début et de fin du mois courant
  const debutMois = moment().startOf('month').toDate();
  const finMois = moment().endOf('month').toDate();

  try {
    const presences = await spa_model.find({
      date: { $gte: debutMois, $lte: finMois }
    });

    let absence = 0;
    let retard = 0;
    let permission = 0;

    presences.forEach(fiche => {
      fiche.absents?.forEach(p => {
        if (String(p.nom || '').trim().toLowerCase() === nomClean) absence++;
      });
      fiche.retardataires?.forEach(p => {
        if (String(p.nom || '').trim().toLowerCase() === nomClean) retard++;
      });
      fiche.permissionnaires?.forEach(p => {
        if (String(p.nom || '').trim().toLowerCase() === nomClean) permission++;
      });
    });

    res.json({
      utilisateur: nom,
      mois: moment().format('MMMM YYYY'),
      absences: absence,
      retards: retard,
      permissions: permission
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;