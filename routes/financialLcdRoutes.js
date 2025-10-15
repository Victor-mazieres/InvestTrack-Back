// routes/financialLcdRoutes.js
const express = require('express');
const router  = express.Router({ mergeParams: true });

const db = require('../models');

// Résolution robuste des modèles (évite undefined)
const Property =
  db.Property ||
  db.sequelize?.models?.Property;

const FinancialInfoLCD =
  db.FinancialInfoLCD ||
  db.sequelize?.models?.FinancialInfoLCD;

if (!Property) {
  console.error('[financialLcdRoutes] ❌ Modèle Property introuvable. Vérifie models/index.js et l’export.');
}
if (!FinancialInfoLCD) {
  console.error('[financialLcdRoutes] ❌ Modèle FinancialInfoLCD introuvable. Vérifie models/index.js et le fichier FinancialInfoLCD.js.');
}

// Remap simple -> renvoie un plain object
function toPlain(x) {
  return !x ? null : (typeof x.get === 'function' ? x.get({ plain: true }) : x);
}

/* =======================
   GET /api/properties/:id/financial/lcd
   ======================= */
router.get('/', async (req, res) => {
  try {
    if (!FinancialInfoLCD) {
      return res.status(500).json({ error: 'Modèle FinancialInfoLCD non chargé (voir logs serveur).' });
    }

    const propertyId = parseInt(req.params.id, 10);
    if (Number.isNaN(propertyId)) {
      return res.status(400).json({ error: 'Param id invalide' });
    }

    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const fin = await FinancialInfoLCD.findOne({ where: { propertyId } });
    if (!fin) return res.status(204).end();

    return res.json(toPlain(fin));
  } catch (err) {
    console.error('LCD GET error:', err?.original?.sqlMessage || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =======================
   POST /api/properties/:id/financial/lcd
   ======================= */
router.post('/', async (req, res) => {
  try {
    if (!FinancialInfoLCD) {
      return res.status(500).json({ error: 'Modèle FinancialInfoLCD non chargé (voir logs serveur).' });
    }

    const propertyId = parseInt(req.params.id, 10);
    if (Number.isNaN(propertyId)) {
      return res.status(400).json({ error: 'Param id invalide' });
    }

    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    // Log utile
    console.log('LCD payload reçu =>', JSON.stringify({ propertyId, ...req.body }, null, 2));

    // On accepte le body tel quel et on force propertyId + rentalMode
    const {
      // communs
      prixAgence, fraisAgence, netVendeur, decoteMeuble, fraisNotairePct,
      travaux, travauxEstimes, travauxRestants,
      tauxPret, dureePretAnnees, apport, assurEmprunteur,
      taxeFonciere, chargesCopro, assurancePno,
      elecGaz, internet, entretien, autreSortie,

      // bloc LCD (peut arriver soit dans lcd, soit à plat)
      lcd: lcdInBody = {},
      nightlyPrice, nightlyPrice2p, targetNightsPerYear, avgStayLength,
      taxeSejourPerNightPerPerson, avgGuests,
      platformFeePct, managementPct, channelManagerMonthly,
      cleaningCostPerStay, laundryCostPerStay, suppliesPerStay, otherVarPerStay,
      availabilityRate, avgOccupancyRate,
      // alias éventuels
      prixNuit, nbJours,
    } = req.body || {};

    // Merge du bloc LCD (priorité aux champs dans lcdInBody)
    const lcdMerged = {
      ...lcdInBody,
      nightlyPrice2p:               lcdInBody?.nightlyPrice2p ?? nightlyPrice2p ?? nightlyPrice ?? prixNuit ?? null,
      targetNightsPerYear:          lcdInBody?.targetNightsPerYear ?? targetNightsPerYear ?? nbJours ?? null,
      avgStayLength:                lcdInBody?.avgStayLength ?? avgStayLength ?? null,
      taxeSejourPerNightPerPerson:  lcdInBody?.taxeSejourPerNightPerPerson ?? taxeSejourPerNightPerPerson ?? null,
      avgGuests:                    lcdInBody?.avgGuests ?? avgGuests ?? null,
      platformFeePct:               lcdInBody?.platformFeePct ?? platformFeePct ?? null,
      managementPct:                lcdInBody?.managementPct ?? managementPct ?? null,
      channelManagerMonthly:        lcdInBody?.channelManagerMonthly ?? channelManagerMonthly ?? null,
      cleaningCostPerStay:          lcdInBody?.cleaningCostPerStay ?? cleaningCostPerStay ?? null,
      laundryCostPerStay:           lcdInBody?.laundryCostPerStay ?? laundryCostPerStay ?? null,
      suppliesPerStay:              lcdInBody?.suppliesPerStay ?? suppliesPerStay ?? null,
      otherVarPerStay:              lcdInBody?.otherVarPerStay ?? otherVarPerStay ?? null,
      availabilityRate:             lcdInBody?.availabilityRate ?? availabilityRate ?? null,
      avgOccupancyRate:             lcdInBody?.avgOccupancyRate ?? avgOccupancyRate ?? null,
    };

    // Payload pour table LCD
    const payload = {
      propertyId,

      // Commun acquisition/charges/crédit
      prixAgence, fraisAgence, netVendeur, decoteMeuble, fraisNotairePct,
      travaux, travauxEstimes, travauxRestants,
      tauxPret, dureePretAnnees, apport, assurEmprunteur,
      taxeFonciere, chargesCopro, assurancePno,
      elecGaz, internet, entretien, autreSortie,

      // Spécifique LCD
      rentalMode: 'LCD',
      lcd: lcdMerged,

      // colonnes “reporting rapide”
      nightlyPrice:               lcdMerged.nightlyPrice2p ?? null,
      targetNightsPerYear:        lcdMerged.targetNightsPerYear ?? null,
      avgStayLength:              lcdMerged.avgStayLength ?? null,
      taxeSejourPerNightPerPerson:lcdMerged.taxeSejourPerNightPerPerson ?? null,
      avgGuests:                  lcdMerged.avgGuests ?? null,
      platformFeePct:             lcdMerged.platformFeePct ?? null,
      managementPct:              lcdMerged.managementPct ?? null,
      channelManagerMonthly:      lcdMerged.channelManagerMonthly ?? null,
      cleaningCostPerStay:        lcdMerged.cleaningCostPerStay ?? null,
      laundryCostPerStay:         lcdMerged.laundryCostPerStay ?? null,
      suppliesPerStay:            lcdMerged.suppliesPerStay ?? null,
      otherVarPerStay:            lcdMerged.otherVarPerStay ?? null,
      availabilityRate:           lcdMerged.availabilityRate ?? null,
      avgOccupancyRate:           lcdMerged.avgOccupancyRate ?? null,
    };

    // Upsert
    let fin = await FinancialInfoLCD.findOne({ where: { propertyId } });
    fin = fin ? await fin.update(payload) : await FinancialInfoLCD.create(payload);

    return res.json(toPlain(fin));
  } catch (err) {
    console.error('LCD POST error:', err?.original?.sqlMessage || err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
