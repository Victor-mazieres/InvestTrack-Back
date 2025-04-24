// src/routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const Tenant = db.Tenant;
const User = db.User; // Assurez-vous que le modèle User est bien importé

// S'assurer que le dossier "uploads" existe
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurer multer pour le stockage sur disque dans le dossier "uploads"
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Créer un locataire (POST)
// Exige que les champs userId, name, firstName, email, phone et dateOfBirth soient fournis.
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const { userId, name, firstName, email, phone, dateOfBirth } = req.body;
    if (!userId || !name || !firstName || !email || !phone || !dateOfBirth) {
      return res.status(400).json({ error: 'Les champs userId, name, firstName, email, phone et dateOfBirth sont obligatoires.' });
    }
    
    // Vérifier que l'utilisateur existe dans la table users
    let user = await User.findByPk(userId);
    if (!user) {
      console.warn(`Aucun utilisateur trouvé pour l'ID ${userId}. Création d'un utilisateur dummy.`);
      // Créez un utilisateur dummy en fournissant les champs obligatoires.
      // Adaptez ces valeurs par défaut selon la définition de votre modèle User.
      user = await User.create({
        id: userId, // Utilise l'ID fourni
        username: "Dummy" + userId, // Un username par défaut
        email: email, // Utilise l'email fourni, ou une valeur par défaut
        password: "dummyPassword", // Un mot de passe par défaut (attention : en prod, vous ne devez jamais stocker de mot de passe non hashé)
        // Ajoutez ici d'autres champs obligatoires si nécessaire
      });
    }
    
    // Conversion du champ dateOfBirth en format ISO si possible.
    let convertedDate;
    if (Date.parse(dateOfBirth)) {
      convertedDate = new Date(dateOfBirth).toISOString();
    } else {
      convertedDate = dateOfBirth;
    }
    req.body.dateOfBirth = convertedDate;
    
    // Si un fichier est téléchargé, mettre à jour le champ profilePicture avec son chemin.
    if (req.file) {
      req.body.profilePicture = req.file.path;
    }
    
    console.log("Début de la soumission du formulaire", req.body);
    const newTenant = await Tenant.create(req.body);
    return res.status(201).json(newTenant);
  } catch (error) {
    console.error('Erreur lors de la création du locataire:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer tous les locataires (GET)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const tenants = userId
      ? await Tenant.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
      : await Tenant.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(tenants);
  } catch (error) {
    console.error('Erreur lors de la récupération des locataires:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer un locataire par ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Locataire introuvable' });
    }
    return res.json(tenant);
  } catch (error) {
    console.error('Erreur lors de la récupération du locataire:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Mettre à jour un locataire (PUT)
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Tenant.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Locataire introuvable' });
    }
    const updatedTenant = await Tenant.findByPk(req.params.id);
    return res.json(updatedTenant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du locataire:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Supprimer un locataire (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tenant.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Locataire introuvable' });
    }
    return res.json({ message: 'Locataire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du locataire:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
