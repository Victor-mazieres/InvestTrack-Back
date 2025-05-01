const express = require('express');
const { FinancialInfo, Property } = require('../models');
const router = express.Router({ mergeParams: true });

// Helper to remap DB keys to front-end expected keys
function remap(fin) {
  const data = fin.toJSON();
  return {
    ...data,
    // Acronyms upper-case for front-end
    loyerHC: data.loyerHc,
    chargesLoc: data.chargesLoc,
    entreeHC: data.entreeHc,
    totalCC: data.totalCc,
    // PNO field mapping
    assurancePNO: data.assurancePno,
    assurancePNOPeriod: data.assurancePnoPeriod,
  };
}

// GET /api/properties/:id/financial
router.get('/', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const fin = await FinancialInfo.findOne({ where: { propertyId } });
    if (!fin) return res.status(204).end();

    res.json(remap(fin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/properties/:id/financial
router.post('/', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    // Destructure request body
    const {
      prixAgence = 0,
      fraisAgence = 0,
      netVendeur = 0,
      decoteMeuble = 0,
      fraisNotairePct = 0,
      travaux = 0,
      tauxPret = 0,
      dureePret = 0,
      taxeFonciere = 0,
      taxeFoncierePeriod = 'annual',
      chargesCopro = 0,
      chargesCoproPeriod = 'annual',
      assurancePNO = 0,
      assurancePNOPeriod = 'annual',
      assurEmprunteur = 0,
      chargeRecup = 0,
      elecGaz = 0,
      autreSortie = 0,
      loyerHC = 0,
      chargesLoc = 0,
      tmi = 0,
      cotSocPct = 0,
      emprunt = 0,
      mensualite = 0,
      totalSorties = 0,
      entreeHC = 0,
      totalCC = 0,
      impotMensuel = 0,
      impotAnnuel = 0,
      cfMensuel = 0,
      cfAnnuel = 0,
      cfTotal = 0,
      cfNetNetMensuel = 0,
      cfNetNetAnnuel = 0,
      cfNetNetTotal = 0,
      interets = 0,
      roi = 0,
      travauxEstimes = 0,
      travauxRestants = 0,
    } = req.body;

    // Map to model fields
    const payload = {
      propertyId,
      prixAgence,
      fraisAgence,
      netVendeur,
      decoteMeuble,
      fraisNotairePct,
      travaux,
      tauxPret,
      dureePretAnnees: dureePret,
      taxeFonciere,
      taxeFoncierePeriod,
      chargesCopro,
      chargesCoproPeriod,
      assurancePno: assurancePNO,
      assurancePnoPeriod: assurancePNOPeriod,
      assurEmprunteur,
      chargeRecup,
      elecGaz,
      autreSortie,
      loyerHc: loyerHC,
      chargesLoc,
      tmi,
      cotSocPct,
      emprunt,
      mensualite,
      totalSorties,
      entreeHc: entreeHC,
      totalCc: totalCC,
      impotMensuel,
      impotAnnuel,
      cfMensuel,
      cfAnnuel,
      cfTotal,
      cfNetNetMensuel,
      cfNetNetAnnuel,
      cfNetNetTotal,
      interets,
      roi,
      travauxEstimes,
      travauxRestants,
    };

    let fin = await FinancialInfo.findOne({ where: { propertyId } });
    if (fin) {
      fin = await fin.update(payload);
    } else {
      fin = await FinancialInfo.create(payload);
    }

    res.json(remap(fin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
