var express = require('express');
var router = express.Router();
var User = require('../models/user')
const jwt = require('jsonwebtoken');
const { Permanence } = require('../models/permanence');
const verifyToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/role');
const logAction = require("../utils/logger");

// Verify JWT token validity
router.get('/auth/verify', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token valide', user: req.user });
});

/* POST register new user. */
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Enregistre un nouvel utilisateur avec les informations fournies.
 *     tags: [Users]
 *     parameters:
 *       - in: body
 *         name: user
 *         description: Les informations de l'utilisateur à enregistrer.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 *             email:
 *               type: string
 *             tel:
 *               type: string
 *             genre:
 *               type: string
 *             pseudo:
 *               type: string
 *             password:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès.
 *       500:
 *         description: Erreur lors de la sauvegarde de l'utilisateur.
 *        
 */
router.post('/register', async function(req, res, next) {
  try {
    const {
      nom,
      email,
      tel,
      pole,
      age,
      lieu,
      pseudo,
      password,
    } = req.body;
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà enregistré' });
    }

    // Vérifier si le pseudo existe déjà
    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) {
      return res.status(409).json({ message: 'Ce pseudo est déjà utilisé' });
    }

    const nouvelleUtilisateur = new User({
      nom,
      email,
      tel,
      pole,
      age,
      lieu,
      pseudo,
      password,
      lastLogin: new Date()
    });

    await nouvelleUtilisateur.save();
    // create JWT token
    const payload = { id: nouvelleUtilisateur._id, role: nouvelleUtilisateur.role, pseudo: nouvelleUtilisateur.pseudo };
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    const { password: _p, ...userSafe } = nouvelleUtilisateur.toObject();
    res.status(201).json({ message: 'Utilisateur enregistrée avec succès', fiche: userSafe, token });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la sauvegarde', error: err.message });
  }
});

// Login user by email and password
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Authentifie un utilisateur en utilisant son email et son mot de passe.
 *     tags: [Users]
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: Les informations d'identification de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Authentification réussie.
 *       401:
 *         description: Email ou mot de passe invalide.
 */
router.post('/login', async function(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
    // create JWT token
    user.lastLogin = new Date();
    await user.save();
    const payload = { id: user._id, role: user.role, pseudo: user.pseudo };
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    // remove password before sending user back
    const { password: _p, ...userSafe } = user.toObject();
    res.status(200).json({ message: 'Authentification réussie', fiche: userSafe, token });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'authentification', error: err.message });
  }
}
);

// /* PUT update user by ID. */
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur par ID
 *     description: Met à jour les informations d'un utilisateur spécifique en utilisant son ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de l'utilisateur à mettre à jour.
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: Les nouvelles informations de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 *             email:
 *               type: string
 *             tel:
 *               type: string
 *             genre:
 *               type: string
 *             pseudo:
 *               type: string
 *             password:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 */
router.put('/users/:id', verifyToken, authorizeRole("admin"), async function(req, res, next) {
  try {
    const { nom, lieu, email, tel, genre, pseudo, role, age } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nom, lieu, email, tel, genre, pseudo, role, age } ,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    await logAction(req, "UPDATE", "Mise à jour des informations utilisateur");
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', fiche: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: err.message });
  }
}
);
// PUT update profile user info with token
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     description: Met à jour les informations du profil de l'utilisateur connecté en utilisant le token JWT.
 *     tags: [Users]
 *     parameters:
 *       - in: body
 *         name: profile
 *         description: Les nouvelles informations du profil de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nom:
 *               type: string
 *             lieu:
 *               type: string
 *             email:
 *               type: string
 *             tel:
 *               type: string
 *             pseudo:
 *               type: string
 *             age:
 *               type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès.
 */
router.put('/users/profile', verifyToken, async function(req, res, next) {
  try {
    const { nom, lieu, email, tel, pseudo, age } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { nom, lieu, email, tel, pseudo, age } ,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    await logAction(req, "UPDATE_PROFILE", "Mise à jour du profil utilisateur");
    res.status(200).json({ message: 'Profil mis à jour avec succès', fiche: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: err.message });
  }
}
);
// /* UPDATE user password by ID. */
/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Mettre à jour le mot de passe d'un utilisateur par ID
 *     description: Met à jour le mot de passe d'un utilisateur spécifique en utilisant son ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de l'utilisateur dont le mot de passe doit être mis à jour.
 *         schema:
 *           type: string
 *       - in: body
 *         name: password
 *         description: Le nouveau mot de passe de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès.
 */
router.put('/users/:id/password', verifyToken, authorizeRole("admin"), async function(req, res, next) {
  try {
    const { password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Mot de passe mis à jour avec succès', fiche: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe', error: err.message });
  }
}
);

/* DELETE user by ID. */
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur par ID
 *     description: Supprime un utilisateur spécifique en utilisant son ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 */

router.delete('/users/:id', verifyToken, authorizeRole("admin"), async function(req, res, next) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    await logAction(req, "DELETE", "Suppression d'un utilisateur");
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: err.message });
  }
}
);

// GET permanence by user pseudo
/**
 * @swagger
 * /api/users/pseudo/{pseudo}:
 *   get:
 *     summary: Récupérer un les permanences d'un son utilisateur par pseudo
 *     description: Récupère les informations de permanence d'un utilisateur spécifique en utilisant son pseudo.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: pseudo
 *         required: true
 *         description: Le pseudo de l'utilisateur à récupérer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */


router.get('/users/pseudo/:pseudo', async function(req, res, next) {
  try {
    const user = await Permanence.findOne({ nom: req.params.pseudo });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la permanence l\'utilisateur', error: err.message });
  }
});  
// Ajouter un nouvelle agent 
/** * @swagger
 * /api/addAgent:
 *   post:
 *     summary: Ajouter un nouvel agent
 *     description: Ajoute un nouvel agent avec les informations fournies.
 *     tags: [Users]
 *     parameters:
 *       - in: body
 *         name: user
 *         description: Les informations de l'agent à ajouter.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nom:
 *               type: string
 *             email:
 *               type: string
 *             tel:
 *               type: string
 *             pole:
 *               type: string
 *             age:
 *               type: integer
 *             lieu:
 *               type: string
 *             pseudo:
 *               type: string
 *             password:
 *               type: string
 *            role:
 *              type: string
 *     responses:
 *       201:
 *         description: Agent ajouté avec succès.
 *       500:
 *         description: Erreur lors de l'ajout de l'agent.
 */
router.post('/addAgent', verifyToken, authorizeRole("admin"), async function(req, res, next) {
  try {
    const {
      nom,
      email,
      tel,
      pole,
      age,
      lieu,
      pseudo,
      password,
      role
    } = req.body;
    console.log(req.body);   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà enregistré' });
    }
    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) {
      return res.status(409).json({ message: 'Ce pseudo est déjà utilisé' });
    }
    const nouvelleUtilisateur = new User({
      nom,
      email,
      tel,
      pole,
      age,
      lieu,
      pseudo,
      password,
      role
    });
    await nouvelleUtilisateur.save();
    await logAction(req, "AJOUT_AGENT", "Un agent a été ajouté");
    res.status(201).json({ message: 'Utilisateur enregistrée avec succès'});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
