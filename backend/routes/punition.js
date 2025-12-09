const express = require('express');
const router = express.Router();
const punition = require('../models/punition');


// POST Enregistrer une nouvelle punition

/**
* @swagger
*tag: Punition
* /api/newpunition:
*   post:
*     summary: Enregistre une nouvelle punition
*     description: Enregistre une nouvelle punition pour un utilisateur.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               id_utilisateur:
*                 type: string
*                 description: L'identifiant de l'utilisateur puni.
*               motif:
*                 type: string
*                 description: Le motif de la punition.
*               sanction:
*                 type: string
*                 description: la punition.
*               responsable:
*                 type: string
*                 description: Le coordonateur qui donne la punition.
*               date:
*                 type: string
*                 format: date-time
*                 description: La date de la punition.
*     responses:
*       201:
*         description: Punition enregistrée avec succès.
*       500:
*         description: Erreur lors de l'enregistrement de la punition.
*/
router.post('/newpunition', async (req, res) => {
  try {
    const { 
      id_perso, 
      motif, 
      sanction,
      responsable 
    } = req.body;
    const nouvellePunition = new punition({
      id_perso,
      motif,
      sanction,
      responsable,
      date: date ? new Date(date) : new Date()
    });
    await nouvellePunition.save();
    res.status(201).json({ message: 'Punition enregistrée avec succès', punition: nouvellePunition });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'enregistrement de la punition", error: err.message });
  }
});

// GET /punition - Récupérer toutes les punitions
/**
* @swagger
*tag: Punition
* /api/punition:
*   get:
*     summary: Récupère toutes les punitions
*     description: Récupère une liste de toutes les punitions enregistrées dans la base de données.
*     responses:
*       200:
*         description: Liste des punitions récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                     description: L'identifiant de la punition.
*                   id_perso:
*                     type: string
*                     description: L'identifiant de l'utilisateur puni.
*                   date:
*                     type: string
*                     format: date-time
*                     description: La date de la punition.
*                   motif:
*                     type: string
*                     description: Le motif de la punition.
*                   sanction:
*                     type: string
*                     description: La sanction imposée.
*                   responsable:
*                     type: string
*                     description: Le coordonateur qui a imposé la punition.
*       500:
*         description: Erreur serveur lors de la récupération des punitions.
*/
router.get('/punition', async (req, res) => {
  try {
    const punitions = await punition.find();
    res.json(punitions);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
// GET /punition/:id - Récupérer toutes les punitions d'un utilisateur
/**
* @swagger
*tag: Punition
* /api/punition/{id}:
*   get:
*     summary: Récupère les punitions d'un utilisateur par son identifiant
*     description: Récupère une liste de toutes les punitions d'un utilisateur spécifique en utilisant son identifiant.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: L'identifiant de l'utilisateur pour lequel les punitions sont récupérées.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Liste des punitions de l'utilisateur récupérée avec succès.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   _id:
*                     type: string
*                     description: L'identifiant de la punition.
*                   id_perso:
*                     type: string
*                     description: L'identifiant de l'utilisateur puni.
*                   date:
*                     type: string
*                     format: date-time
*                     description: La date de la punition.
*                   motif:
*                     type: string
*                     description: Le motif de la punition.
*                   sanction:
*                     type: string
*                     description: La sanction imposée.
*                   responsable:
*                     type: string
*                     description: Le coordonateur qui a imposé la punition.
*       404:
*         description: Aucune punition trouvée pour l'utilisateur spécifié.
*       500:
*         description: Erreur serveur lors de la récupération des punitions de l'utilisateur.
*/
router.get('/punition/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const punitions = await punition.find({ id_perso: id });
    
    if (punitions.length === 0) {
      return res.status(404).json({ message: "Aucune punition trouvée pour cet utilisateur" });
    }
    
    res.json(punitions);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
