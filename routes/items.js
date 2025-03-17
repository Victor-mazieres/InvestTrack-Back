const express = require('express');
const router = express.Router();

// Endpoint GET : Retourne la liste des items
router.get('/items', (req, res) => {
  const items = [
    { id: 1, name: 'Item A' },
    { id: 2, name: 'Item B' }
  ];
  res.json(items);
});

// Endpoint POST : Affiche dans la console les données reçues et retourne une confirmation
router.post('/items', (req, res) => {
  console.log('Données reçues :', req.body);
  res.json({ message: 'Item créé', data: req.body });
});

module.exports = router;
