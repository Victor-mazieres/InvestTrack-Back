// === routes/SimulationRoutes.js ===
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { Simulation } = require('../models');  // Import du modèle Simulation

// Créer une simulation (POST /simulations)
router.post('/simulations', authMiddleware, async (req, res) => {
  try {
    const simulationData = req.body;

    // Lier la simulation à l'utilisateur connecté
    // (la propriété 'userId' doit exister dans la table si vous l'avez ajoutée)
    simulationData.userId = req.user.id;

    const simulation = await Simulation.create(simulationData);

    res.status(201).json({ message: 'Simulation sauvegardée', simulation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde de la simulation' });
  }
});

// Récupérer toutes les simulations de l'utilisateur (GET /simulations)
router.get('/simulations', authMiddleware, async (req, res) => {
  try {
    const simulations = await Simulation.findAll({ where: { userId: req.user.id } });
    res.json(simulations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des simulations' });
  }
});

// Récupérer une simulation par son ID (GET /simulations/:id)
router.get('/simulations/:id', authMiddleware, async (req, res) => {
  try {
    const simulation = await Simulation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation non trouvée' });
    }
    res.json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la simulation' });
  }
});

// Supprimer une simulation (DELETE /simulations/:id)
router.delete('/simulations/:id', authMiddleware, async (req, res) => {
  try {
    const simulation = await Simulation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!simulation) {
      return res.status(404).json({ message: 'Simulation non trouvée' });
    }
    await simulation.destroy();
    res.json({ message: 'Simulation supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la simulation' });
  }
});

module.exports = router;
