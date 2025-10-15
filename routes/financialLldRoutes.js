// routes/financialLldRoutes.js
const express = require('express');
const router  = express.Router({ mergeParams: true });
const db      = require('../models'); // <- important: on prend l'index, pas un destructuring direct
const { Property, FinancialInfoLLD } = db;

/* ========= helpers: parse ========= */
const toNum = (v, { allowNull = false } = {}) => {
  if (v === null || v === undefined) return allowNull ? null : 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : (allowNull ? null : 0);
  // string
  const s = String(v).trim();
  if (s === '') return allowNull ? null : 0;
  // remplace virgule -> point, retire tout sauf chiffre, point, signe -
  const cleaned = s
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^0-9\.\-]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return allowNull ? null : 0;
  return n;
};

const toPct = (v, { allowNull = false, min = 0, max = 100 } = {}) => {
  const n = toNum(v, { allowNull });
  if (n === null) return null;
  // borne pour éviter "out of range"
  if (n < min) return min;
  if (n > max) return max;
  return n;
};

// Mise en forme de la réponse (plain object)
const toPlain = (inst) => (inst && typeof inst.get === 'function' ? inst.get({ plain: true }) : inst);

/* ========= GET: /api/properties/:id/financial/lld ========= */
router.get('/', async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    if (!Number.isFinite(propertyId)) return res.status(400).json({ error: 'Paramètre id invalide' });

    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const fin = await FinancialInfoLLD.findOne({ where: { propertyId } });
    if (!fin) return res.status(204).end();

    return res.json(toPlain(fin));
  } catch (err) {
    console.error('LLD GET error:', err?.original?.sqlMessage || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ========= POST: /api/properties/:id/financial/lld ========= */
router.post('/', async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    if (!Number.isFinite(propertyId)) return res.status(400).json({ error: 'Paramètre id invalide' });

    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const b = req.body || {};

    // Normalisation de TOUTES les valeurs numériques
    const payload = {
      propertyId,

      // Achat / Crédit
      prixAgence:      toNum(b.prixAgence),
      fraisAgence:     toNum(b.fraisAgence),
      netVendeur:      toNum(b.netVendeur),
      decoteMeuble:    toNum(b.decoteMeuble),
      fraisNotairePct: toPct(b.fraisNotairePct),          // <= important (borne 0..100, retire % et ,)
      travaux:         toNum(b.travaux),
      travauxEstimes:  toNum(b.travauxEstimes),
      travauxRestants: toNum(b.travauxRestants),
      tauxPret:        toPct(b.tauxPret, { max: 100 }),   // en %, borne 0..100
      dureePretAnnees: Math.max(1, Math.round(toNum(b.dureePretAnnees))), // entier >= 1
      apport:          toNum(b.apport),
      assurEmprunteur: toNum(b.assurEmprunteur),

      // Charges & périodes
      taxeFonciere:       toNum(b.taxeFonciere),
      taxeFoncierePeriod: b.taxeFoncierePeriod === 'monthly' ? 'monthly' : 'annual',
      chargesCopro:       toNum(b.chargesCopro),
      chargesCoproPeriod: b.chargesCoproPeriod === 'monthly' ? 'monthly' : 'annual',
      assurancePno:       toNum(b.assurancePno),
      assurancePnoPeriod: b.assurancePnoPeriod === 'monthly' ? 'monthly' : 'annual',

      elecGaz:     toNum(b.elecGaz),
      internet:    toNum(b.internet),
      entretien:   toNum(b.entretien),
      autreSortie: toNum(b.autreSortie),
      chargeRecup: toNum(b.chargeRecup),

      // Flux locatifs
      loyerHc:    toNum(b.loyerHc),
      chargesLoc: toNum(b.chargesLoc),

      // Fiscalité
      tmi:       toPct(b.tmi, { max: 100 }),
      cotSocPct: toPct(b.cotSocPct, { max: 100 }),

      // Résultats / agrégats
      emprunt:           toNum(b.emprunt),
      mensualite:        toNum(b.mensualite),
      totalSorties:      toNum(b.totalSorties),
      entreeHc:          toNum(b.entreeHc),
      totalCc:           toNum(b.totalCc),
      impotMensuel:      toNum(b.impotMensuel),
      impotAnnuel:       toNum(b.impotAnnuel),
      cfMensuel:         toNum(b.cfMensuel),
      cfAnnuel:          toNum(b.cfAnnuel),
      cfTotal:           toNum(b.cfTotal),
      cfNetNetMensuel:   toNum(b.cfNetNetMensuel),
      cfNetNetAnnuel:    toNum(b.cfNetNetAnnuel),
      cfNetNetTotal:     toNum(b.cfNetNetTotal),
      interets:          toNum(b.interets),
      roi:               toPct(b.roi, { max: 100 }),
    };

    // DEBUG éventuel
    // console.log('LLD payload normalisé =>', payload);

    let fin = await FinancialInfoLLD.findOne({ where: { propertyId } });
    fin = fin ? await fin.update(payload) : await FinancialInfoLLD.create(payload);

    return res.json(toPlain(fin));
  } catch (err) {
    console.error('LLD POST error:', err?.original?.sqlMessage || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
