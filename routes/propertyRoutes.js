// src/routes/propertyRoutes.js
const express = require('express');
const router  = express.Router();

const { Property, FinancialInfoLLD, FinancialInfoLCD } = require('../models');

/* ---------------------- helpers ---------------------- */
function normalizeRentalKind(raw) {
  const v = String(raw || '').trim().toUpperCase();
  return ['LLD','LCD','AV'].includes(v) ? v : null;
}

// Helpers locaux (autonomes) pour convertir une instance Sequelize en plain object
function toPlain(x) {
  return !x ? null : (typeof x.get === 'function' ? x.get({ plain: true }) : x);
}
function remapFinancialLld(fin) {
  const data = toPlain(fin);
  return data || null;
}
function remapFinancialCld(fin) {
  const data = toPlain(fin);
  return data || null;
}

/* ---------------------- CREATE ---------------------- */
router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId est requis' });

    const rentalKind = normalizeRentalKind(req.body.rentalKind);
    if (!rentalKind) {
      return res.status(400).json({ error: "rentalKind doit valoir 'LLD', 'LCD' ou 'AV'." });
    }
    const mode = rentalKind === 'AV' ? 'achat_revente' : 'location';

    const payload = { ...req.body, rentalKind, mode };
    const newProperty = await Property.create(payload);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Erreur création bien :', error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

/* ---------------------- READ ALL ---------------------- */
router.get('/', async (req, res) => {
  try {
    const where = {};

    const hasUserIdAttr = !!Property.rawAttributes?.userId;
    if (req.query.userId && hasUserIdAttr) {
      const uid = Number(req.query.userId);
      if (!Number.isNaN(uid)) where.userId = uid;
    }

    const rows = await Property.findAll({
      where,
      include: [
        { model: FinancialInfoLLD, as: 'financialLld', required: false },
        { model: FinancialInfoLCD, as: 'financialCld', required: false },
      ],
      order: [['createdAt', 'DESC']], // ✅ timestamps Sequelize
    });

    const out = rows.map(p => {
      const plain = toPlain(p);
      return {
        ...plain,
        financialLld: plain.financialLld ? remapFinancialLld(plain.financialLld) : null,
        financialCld: plain.financialCld ? remapFinancialCld(plain.financialCld) : null,
        // Compat éventuelle : expose "financialInfo" selon rentalKind si ton front le lit encore
        financialInfo:
          String(plain.rentalKind || '').toUpperCase() === 'LCD'
            ? (plain.financialCld ? remapFinancialCld(plain.financialCld) : null)
            : String(plain.rentalKind || '').toUpperCase() === 'LLD'
              ? (plain.financialLld ? remapFinancialLld(plain.financialLld) : null)
              : null,
      };
    });

    return res.json(out);
  } catch (error) {
    console.error('Erreur récupération biens :', error?.original?.sqlMessage || error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

/* ---------------------- READ ONE ---------------------- */
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        { model: FinancialInfoLLD, as: 'financialLld', required: false },
        { model: FinancialInfoLCD, as: 'financialCld', required: false },
      ]
    });
    if (!property) return res.status(404).json({ error: 'Bien introuvable' });

    const plain = toPlain(property);
    const out = {
      ...plain,
      financialLld: plain.financialLld ? remapFinancialLld(plain.financialLld) : null,
      financialCld: plain.financialCld ? remapFinancialCld(plain.financialCld) : null,
      financialInfo:
        String(plain.rentalKind || '').toUpperCase() === 'LCD'
          ? (plain.financialCld ? remapFinancialCld(plain.financialCld) : null)
          : String(plain.rentalKind || '').toUpperCase() === 'LLD'
            ? (plain.financialLld ? remapFinancialLld(plain.financialLld) : null)
            : null,
    };

    return res.json(out);
  } catch (error) {
    console.error('Erreur récupération bien :', error?.original?.sqlMessage || error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

/* ---------------------- READ FINANCIAL ONLY ---------------------- */
router.get('/:id/financial', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const [lld, lcd] = await Promise.all([
      FinancialInfoLLD.findOne({ where: { propertyId } }),
      FinancialInfoLCD.findOne({ where: { propertyId } }),
    ]);
    return res.json({
      financialLld: lld ? remapFinancialLld(lld) : null,
      financialCld: lcd ? remapFinancialCld(lcd) : null,
    });
  } catch (error) {
    console.error('Erreur récupération financialInfo :', error?.original?.sqlMessage || error);
    return res.status(500).send();
  }
});

/* ---------------------- UPDATE ---------------------- */
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

    const [updated] = await Property.update(body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Bien introuvable' });

    const updatedProperty = await Property.findByPk(req.params.id, {
      include: [
        { model: FinancialInfoLLD, as: 'financialLld', required: false },
        { model: FinancialInfoLCD, as: 'financialCld', required: false },
      ]
    });
    const plain = toPlain(updatedProperty);
    const out = {
      ...plain,
      financialLld: plain.financialLld ? remapFinancialLld(plain.financialLld) : null,
      financialCld: plain.financialCld ? remapFinancialCld(plain.financialCld) : null,
      financialInfo:
        String(plain.rentalKind || '').toUpperCase() === 'LCD'
          ? (plain.financialCld ? remapFinancialCld(plain.financialCld) : null)
          : String(plain.rentalKind || '').toUpperCase() === 'LLD'
            ? (plain.financialLld ? remapFinancialLld(plain.financialLld) : null)
            : null,
    };

    return res.json(out);
  } catch (error) {
    console.error('Erreur mise à jour bien :', error?.original?.sqlMessage || error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

/* ---------------------- DELETE ---------------------- */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Bien introuvable' });
    return res.json({ message: 'Bien supprimé' });
  } catch (error) {
    console.error('Erreur suppression bien :', error?.original?.sqlMessage || error);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

module.exports = router;
