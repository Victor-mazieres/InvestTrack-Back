// propertyRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const Property = db.Property;

// Créer un bien immobilier (POST)
// On exige la présence d'un userId dans le body pour associer l'enregistrement.
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId est requis pour associer le bien à un compte' });
    }
    const newProperty = await Property.create(req.body);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Erreur lors de la création du bien immobilier:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Récupérer tous les biens immobiliers (GET)
// Optionnel : possibilité de filtrer par userId via une query string.
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const properties = userId
      ? await Property.findAll({ where: { userId } })
      : await Property.findAll();
    return res.json(properties);
  } catch (error) {
    console.error('Erreur lors de la récupération des biens immobiliers:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Les autres endpoints (GET par ID, PUT, DELETE) restent inchangés
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Bien immobilier introuvable' });
    }
    return res.json(property);
  } catch (error) {
    console.error('Erreur lors de la récupération du bien immobilier:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Property.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Bien immobilier introuvable' });
    }
    const updatedProperty = await Property.findByPk(req.params.id);
    return res.json(updatedProperty);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bien immobilier:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Bien immobilier introuvable' });
    }
    return res.json({ message: 'Bien immobilier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bien immobilier:', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
