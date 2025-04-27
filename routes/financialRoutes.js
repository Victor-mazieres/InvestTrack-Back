// routes/financialRoutes.js
const express = require('express');
const router  = express.Router();
const db      = require('../models');
const Property= db.Property;

// GET  /api/properties/:id/financial
router.get('/properties/:id/financial', async (req, res) => {
  try {
    const prop = await Property.findByPk(req.params.id, {
      attributes: ['financial'],
    });
    if (!prop) return res.status(404).json({ error: 'Bien non trouvé' });
    return res.json({ financial: prop.financial });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT  /api/properties/:id/financial
router.put('/properties/:id/financial', async (req, res) => {
  try {
    const prop = await Property.findByPk(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Bien non trouvé' });

    const { financial } = req.body;
    await prop.update({ financial });
    return res.json({ message: 'Financial saved', financial: prop.financial });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
