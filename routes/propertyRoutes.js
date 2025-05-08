// src/routes/propertyRoutes.js

const express = require('express');
const router  = express.Router();
const { Property, FinancialInfo } = require('../models');

/**
 * Helper pour remapper certains champs de financialInfo
 * (acronymes en majuscules, suffixes HC/CC, etc.)
 */
function remapFinancial(fin) {
  if (!fin || Object.keys(fin).length === 0) return {};
  return {
    ...fin,
    // Acronymes / key format pour le front-end
    loyerHC:            fin.loyerHc,
    chargesLoc:         fin.chargesLoc,
    entreeHC:           fin.entreeHc,
    totalCC:            fin.totalCc,
    assurancePNO:       fin.assurancePno,
    assurancePNOPeriod: fin.assurancePnoPeriod,
  };
}

// --- CRUD des biens ---

// Créer un bien
router.post('/', async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ error: 'userId est requis' });
    }
    const newProperty = await Property.create(req.body);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Erreur création bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Lire tous les biens + financialInfo (toujours un objet, même vide)
router.get('/', async (req, res) => {
  try {
    const where = req.query.userId ? { userId: req.query.userId } : {};
    const properties = await Property.findAll({
      where,
      include: [{ model: FinancialInfo, as: 'financialInfo' }]
    });

    const output = properties.map(p => {
      const plain = p.get({ plain: true });
      plain.financialInfo = remapFinancial(plain.financialInfo);
      return plain;
    });

    return res.json(output);
  } catch (error) {
    console.error('Erreur récupération biens :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Lire un bien + financialInfo (toujours un objet, même vide)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: FinancialInfo, as: 'financialInfo' }]
    });
    if (!property) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }

    const plain = property.get({ plain: true });
    plain.financialInfo = remapFinancial(plain.financialInfo);

    return res.json(plain);
  } catch (error) {
    console.error('Erreur récupération bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Lire uniquement les données financières d’un bien (toujours un objet)
router.get('/:id/financial', async (req, res) => {
  try {
    const finInstance = await FinancialInfo.findOne({
      where: { propertyId: req.params.id }
    });
    const plain = finInstance
      ? finInstance.get({ plain: true })
      : {};
    return res.json(remapFinancial(plain));
  } catch (error) {
    console.error('Erreur récupération financialInfo :', error);
    return res.status(500).send();
  }
});

// Créer ou mettre à jour les données financières d’un bien
router.post('/:id/financial', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const [finInfo, created] = await FinancialInfo.findOrCreate({
      where: { propertyId },
      defaults: { propertyId, ...req.body },
    });
    if (!created) {
      await finInfo.update(req.body);
    }
    const plain = finInfo.get({ plain: true });
    return res.json(remapFinancial(plain));
  } catch (error) {
    console.error('Erreur création/MÀJ financialInfo :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Mettre à jour un bien
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Property.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    const updatedProperty = await Property.findByPk(req.params.id, {
      include: [{ model: FinancialInfo, as: 'financialInfo' }]
    });
    const plain = updatedProperty.get({ plain: true });
    plain.financialInfo = remapFinancial(plain.financialInfo);
    return res.json(plain);
  } catch (error) {
    console.error('Erreur mise à jour bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// Supprimer un bien
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Bien introuvable' });
    }
    return res.json({ message: 'Bien supprimé' });
  } catch (error) {
    console.error('Erreur suppression bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
