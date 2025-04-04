const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assurer que le dossier "uploads" existe
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurer multer pour utiliser diskStorage et sauvegarder dans le dossier "uploads"
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir); // dossier de destination
  },
  filename: function(req, file, cb) {
    // Créer un nom de fichier unique en utilisant la date et un nombre aléatoire
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const db = require('../models');
const Tenant = db.Tenant;

// Créer un locataire (POST)
// On exige un userId et on traite le fichier pour enregistrer le chemin dans profilePicture
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId est requis pour associer le locataire à un compte' });
    }
    // Si un fichier a été téléchargé, mettre à jour le champ profilePicture avec son chemin
    if (req.file) {
      req.body.profilePicture = req.file.path; // ex: "uploads/1634567890123-123456789.jpg"
    }
    console.log("req.body:", req.body);
    const newTenant = await Tenant.create(req.body);
    return res.status(201).json(newTenant);
  } catch (error) {
    console.error('Erreur lors de la création du locataire:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer tous les locataires (GET)
// Optionnel : on peut filtrer par userId si le front-end le fournit via une query string.
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
