// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models'); // Assurez-vous que le chemin est correct
const Property = db.Property;

// Créer un bien (POST)
router.post('/', async (req, res) => {
  try {
    const newProperty = await Property.create(req.body);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Erreur lors de la création du bien:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer tous les biens (GET)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(properties);
  } catch (error) {
    console.error('Erreur lors de la récupération des biens:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer un bien par ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    return res.json(property);
  } catch (error) {
    console.error('Erreur lors de la récupération du bien:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Mettre à jour un bien (PUT)
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Property.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    const updatedProperty = await Property.findByPk(req.params.id);
    return res.json(updatedProperty);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bien:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Supprimer un bien (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    return res.json({ message: 'Bien supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bien:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
