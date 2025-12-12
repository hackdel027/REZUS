const verifyToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/role');
const authorizeRoles = require('../middlewares/roles');
const { Planpermanence, Permanence } = require('../models/permanence');
const express = require('express');
const router = express.Router();

// POST enregistrer une permanence (la personne et le materiel pris en charge)
/**
* @swagger
* /api/registerPermanence/{id}:
*   post:
*     summary: Enregistre une permanence
*     description: Enregistre une permanence pour un utilisateur avec le matériel et l'événement associés.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de la permanence dans la table PlanPermanence.
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               materiel:
*                 type: string
*                 description: Le matériel pris en charge pour la permanence.
*               cr:
*                 type: string
*                 description: L'événement ou le compte rendu associé à la permanence.
*     responses:
*       201:
*         description: Permanence enregistrée avec succès.
*       500:
*         description: Erreur lors de l'enregistrement de la permanence.    
*/
router.post('/registerPermanence/:id', verifyToken, authorizeRole("chefpermanence"), async (req, res) => {
  const {
    date,
    nom,
    heureDebut,
    heureFin,
    materiel,
    evenements,
    montant,
  } = req.body;
  console.log(req.body);
  try {
    const semaineId = req.params.id;

    // Cherche le document contenant l'élément avec cet ID
    const result = await Planpermanence.findOne({ 'semaine._id': semaineId });

    if (!result) {
      return res.status(404).json({ message: 'ID introuvable dans la semaine.' });
    }

    // Trouve le sous-document exact dans le tableau "semaine"
    const jour = result.semaine.find(j => j._id.toString() === semaineId);

    if (!jour) {
      return res.status(404).json({ message: 'Nom non trouvé pour cet ID.' });
    }

    const nouvellePermanence = new Permanence({
      id_semaine: semaineId,
      date: jour.date,
      materiel: materiel,
      evenement: evenements,
      nom: jour.nom,
      heureDebut: heureDebut,
      heureFin: heureFin,
      montant: montant,
    });

    await nouvellePermanence.save();
    res.status(201).json({ message: 'Permanence enregistrée avec succès', permanence: nouvellePermanence });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
})

// GET /getregisteredPermanence - Récupérer toutes les permanences enregistrées

/**
* @swagger
* /api/getregisteredPermanence:
*   get:
*     summary: Récupère toutes les permanences enregistrées
*     description: Récupère la liste de toutes les permanences effectivement réalisées et enregistrées.
*     responses:
*       200:
*         description: Liste des permanences enregistrées récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                   id_semaine:
*                     type: string
*                   date:
*                     type: string
*                     format: date-time
*                   materiel:
*                     type: string
*                   evenement:
*                     type: string
*                   nom:
*                     type: string
*       500:
*         description: Erreur serveur lors de la récupération des permanences enregistrées.
*/
router.get('/getregisteredPermanence', verifyToken, authorizeRoles(["admin", "gestionnaire"]), async (req, res) => {
  try {
    const permanences = await Permanence.find({}).sort({ date: 1 });
    res.json(permanences);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des permanences enregistrées", error: err.message });
  }
});

// GET /getregisteredPermanenceById - Récupérer une permanence enregistrée par son identifiant
/**
* @swagger
* /api/getregisteredPermanenceById/{id}:
*   get:
*     summary: Récupère une permanence enregistrée par son identifiant
*     description: Récupère les détails d'une permanence effectivement réalisée à partir de son identifiant.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de la permanence enregistrée à récupérer.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Permanence enregistrée récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                 id_semaine:
*                   type: string
*                 date:
*                   type: string
*                   format: date-time
*                 materiel:
*                   type: string
*                 evenement:
*                   type: string
*                 nom:
*                   type: string
*       404:
*         description: Permanence non trouvée.
*       500:
*         description: Erreur serveur lors de la récupération de la permanence.
*/
router.get('/getregisteredPermanenceById/:id', verifyToken, authorizeRole("chefpermanence"), async (req, res) => {
  try {
    // Recherche par le champ id_semaine au lieu de l'_id du document
    const permanence = await Permanence.findOne({ id_semaine: req.params.id });
    if (!permanence) {
      return res.status(404).json({ message: "Permanence non trouvée" });
    }
    res.json(permanence);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la permanence", error: err.message });
  }
});
//POST  /createPermanence - Planifier une permanence pour la semaine
/**
* @swagger
* /api/createPermanence:
*   post:
*     summary: Planifie une nouvelle semaine de permanences
*     description: Enregistre une liste de permanences planifiées pour une semaine.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: array
*             items:
*               type: object
*               properties:
*                 nom:
*                   type: string
*                   description: Le nom de la personne de permanence.
*                 date:
*                   type: string
*                   format: date-time
*                   description: La date de la permanence.
*     responses:
*       201:
*         description: Permanence planifiée avec succès.
*       500:
*         description: Erreur lors de la planification de la permanence.
*/
router.post('/createPermanence', verifyToken, authorizeRole("admin"), async (req, res) => {
  try {
    console.log('=== CREATE PERMANENCE ===');
    console.log('Body complet:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    const { semaine } = req.body;
    
    if (!semaine) {
      console.error('❌ Semaine manquante');
      return res.status(400).json({ message: 'Données semaine manquantes' });
    }
    
    console.log('Coordinateur:', semaine.coordinateur);
    console.log('Jours:', semaine.jours);
    
    if (!semaine.coordinateur) {
      console.error('❌ Coordinateur manquant');
      return res.status(400).json({ message: 'Coordinateur manquant' });
    }
    
    if (!semaine.jours || !Array.isArray(semaine.jours) || semaine.jours.length === 0) {
      console.error('❌ Jours invalides');
      return res.status(400).json({ message: 'Jours manquants ou invalides' });
    }
    
    // Vérifier que chaque jour a exactement 3 agents
    for (let i = 0; i < semaine.jours.length; i++) {
      const jour = semaine.jours[i];
      console.log(`Jour ${i}:`, jour);
      
      if (!jour.agents || !Array.isArray(jour.agents)) {
        console.error(`❌ Jour ${jour.nom}: agents manquants ou invalides`);
        return res.status(400).json({ 
          message: `Le jour ${jour.nom} doit avoir un tableau d'agents` 
        });
      }
      
      if (jour.agents.length !== 3) {
        console.error(`❌ Jour ${jour.nom}: ${jour.agents.length} agents au lieu de 3`);
        return res.status(400).json({ 
          message: `Le jour ${jour.nom} doit avoir exactement 3 agents (actuellement: ${jour.agents.length})` 
        });
      }
    }
    
    console.log('✅ Validation OK, création de l\'objet Planpermanence...');
    
    const nouvellePermanence = new Planpermanence({
      semaine: {
        coordinateur: semaine.coordinateur,
        jours: semaine.jours
      }
    });
    
    console.log('Objet créé:', nouvellePermanence);
    
    await nouvellePermanence.save();
    
    console.log('✅ Permanence sauvegardée avec succès');
    
    res.status(201).json({ 
      message: 'Permanence planifiée avec succès', 
      permanence: nouvellePermanence 
    });
  } catch (err) {
    console.error('❌ ERREUR createPermanence:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Name:', err.name);
    
    res.status(500).json({ 
      message: "Erreur lors de la planification de la permanence", 
      error: err.message,
      details: err.errors ? Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })) : undefined
    });
  }
});

// GET /getPermanence - Récupérer toutes les permanences planifiées du mois
/**
* @swagger
* /api/getPermanence:
*   get:
*     summary: Récupère toutes les permanences planifiées du mois en cours
*     description: Récupère la liste des permanences planifiées pour le mois en cours.
*     responses:
*       200:
*         description: Liste des permanences récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                   semaine:
*                     type: array
*                     items:
*                       type: object
*                       properties:
*                         nom:
*                           type: string
*                         date:
*                           type: string
*                           format: date-time
*       500:
*         description: Erreur serveur lors de la récupération des permanences.
*/
router.get('/getPermanence', verifyToken, async (req, res) => {
  try {
    const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const finMois = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const permanences = await Planpermanence.find({
      date: { $gte: debutMois, $lte: finMois }
    }).sort({ date: -1 });

    res.json(permanences);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des permanences", error: err.message });
  }
});

// GET /getPermanenceById - Récupérer une permanence par son identifiant
/**
* @swagger
* /api/getPermanenceById/{id}:
*   get:
*     summary: Récupère une permanence par son identifiant
*     description: Récupère les détails d'une permanence planifiée à partir de son identifiant.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de la permanence à récupérer.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Permanence récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                 semaine:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       nom:
*                         type: string
*                       date:
*                         type: string
*                         format: date-time
*       404:
*         description: Permanence non trouvée.
*       500:
*         description: Erreur serveur lors de la récupération de la permanence.
*/
router.get('/getPermanenceById/:id', verifyToken, async (req, res) => {
  try {
    const permanence = await Planpermanence.findById(req.params.id);
    if (!permanence) {
      return res.status(404).json({ message: "Permanence non trouvée" });
    }
    res.json(permanence);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la permanence", error: err.message });
  }
});
// GET /allPermanences - Récupérer toutes les permanences présentes dans la base de données
/**
* @swagger
* /api/allPermanences:
*   get:
*     summary: Récupère toutes les permanences présentes dans la base de données
*     description: Récupère la liste complète de toutes les permanences enregistrées, sans filtre de date.
*     responses:
*       200:
*         description: Liste complète des permanences récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                   semaine:
*                     type: array
*                     items:
*                       type: object
*                       properties:
*                         nom:
*                           type: string
*                         date:
*                           type: string
*                           format: date-time
*       500:
*         description: Erreur serveur lors de la récupération des permanences.
*/
router.get('/allPermanences', verifyToken, authorizeRoles(["admin", "gestionnaire"]), async (req, res) => {
  try {
    const permanences = await Planpermanence.find({});
    res.json(permanences);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des permanences", error: err.message });
  }
});
// PATCH /updatePlanPermanence/:id - Mettre à jour une permanence planifiée
/**
* @swagger
* /api/updatePlanPermanence/{id}:
*   patch:
*     summary: Met à jour une planification de permanence
*     description: Met à jour la liste des jours et personnes d'une planification de permanence existante.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de la planification de permanence à mettre à jour.
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               semaine:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     nom:
*                       type: string
*                     date:
*                       type: string
*                       format: date-time
*     responses:
*       200:
*         description: Permanence mise à jour avec succès.
*       404:
*         description: Permanence non trouvée.
*       500:
*         description: Erreur lors de la mise à jour de la permanence.
*/
router.patch('/updatePlanPermanence/:id', verifyToken, authorizeRole("gestionnaire"), async (req, res) => {
  try {
    const { semaine } = req.body;
    const updatedPermanence = await Planpermanence.findByIdAndUpdate(req.params.id, { semaine }, { new: true });
    if (!updatedPermanence) {
      return res.status(404).json({ message: "Permanence non trouvée" });
    }
    res.json({ message: 'Permanence mise à jour avec succès', permanence: updatedPermanence });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la permanence", error: err.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Permamences
 *   description: Gestion des permanences
 */
// Exporter le routeur
module.exports = router;