// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const Tenant = db.Tenant;

// Créer un locataire (POST)
router.post('/', async (req, res) => {
  try {
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
    const tenants = await Tenant.findAll({ order: [['createdAt', 'DESC']] });
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
    const [updated] = await Tenant.update(req.body, {
      where: { id: req.params.id }
    });
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
