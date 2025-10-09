// src/routes/propertyRoutes.js
const express = require('express');
const router  = express.Router();
const { Property, FinancialInfo } = require('../models');

function remapFinancial(fin) {
  if (!fin || Object.keys(fin).length === 0) return {};
  return {
    ...fin,
    loyerHC:            fin.loyerHc,
    chargesLoc:         fin.chargesLoc,
    entreeHC:           fin.entreeHc,
    totalCC:            fin.totalCc,
    assurancePNO:       fin.assurancePno,
    assurancePNOPeriod: fin.assurancePnoPeriod,
  };
}

function normalizeRentalKind(raw) {
  const v = String(raw || '').trim().toUpperCase();
  if (['LLD', 'LCD', 'AV'].includes(v)) return v;
  return null;
}

// --- CREATE ---
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId est requis' });

    // On exige rentalKind (LLD | LCD | AV)
    const rentalKind = normalizeRentalKind(req.body.rentalKind);
    if (!rentalKind) {
      return res.status(400).json({ error: "rentalKind doit valoir 'LLD', 'LCD' ou 'AV'." });
    }

    // Mode est déduit par le hook (mais on peut sécuriser ici)
    const mode = rentalKind === 'AV' ? 'achat_revente' : 'location';

    const payload = { ...req.body, rentalKind, mode };
    const newProperty = await Property.create(payload);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Erreur création bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// --- READ ALL ---
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

    return res.json(output); // toujours un tableau
  } catch (error) {
    console.error('Erreur récupération biens :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// --- READ ONE ---
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: FinancialInfo, as: 'financialInfo' }]
    });
    if (!property) return res.status(404).json({ error: 'Bien introuvable' });

    const plain = property.get({ plain: true });
    plain.financialInfo = remapFinancial(plain.financialInfo);
    return res.json(plain);
  } catch (error) {
    console.error('Erreur récupération bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// --- READ FINANCIAL ONLY ---
router.get('/:id/financial', async (req, res) => {
  try {
    const finInstance = await FinancialInfo.findOne({
      where: { propertyId: req.params.id }
    });
    const plain = finInstance ? finInstance.get({ plain: true }) : {};
    return res.json(remapFinancial(plain));
  } catch (error) {
    console.error('Erreur récupération financialInfo :', error);
    return res.status(500).send();
  }
});

// --- UPSERT FINANCIAL ---
router.post('/:id/financial', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const [finInfo, created] = await FinancialInfo.findOrCreate({
      where: { propertyId },
      defaults: { propertyId, ...req.body },
    });
    if (!created) await finInfo.update(req.body);
    const plain = finInfo.get({ plain: true });
    return res.json(remapFinancial(plain));
  } catch (error) {
    console.error('Erreur création/MÀJ financialInfo :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// --- UPDATE ---
router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(body, 'rentalKind')) {
      const rk = normalizeRentalKind(body.rentalKind);
      if (!rk) {
        return res.status(400).json({ error: "rentalKind doit valoir 'LLD', 'LCD' ou 'AV'." });
      }
      body.rentalKind = rk;
      body.mode = rk === 'AV' ? 'achat_revente' : 'location';
    }

    const [updated] = await Property.update(body, {
      where: { id: req.params.id }
    });
    if (!updated) return res.status(404).json({ error: 'Bien introuvable' });

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

// --- DELETE ---
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Bien introuvable' });
    return res.json({ message: 'Bien supprimé' });
  } catch (error) {
    console.error('Erreur suppression bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
