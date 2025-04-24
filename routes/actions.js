// routes/actions.js
const express = require("express");
const router = express.Router();
const { Action } = require("../models");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

// GET - Récupérer toutes les actions de l'utilisateur
router.get("/", async (req, res) => {
  try {
    console.log("req.user:", req.user);
    const userId = Number(req.user.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Token invalide ou id manquant" });
    }
    const actions = await Action.findAll({ where: { userId } });
    const plainActions = actions.map((action) => action.get({ plain: true }));
    res.json(plainActions);
  } catch (err) {
    console.error("Erreur dans GET /api/actions :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des actions" });
  }
});

// POST - Créer une nouvelle action
router.post("/", async (req, res) => {
  try {
    const userId = Number(req.user.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Token invalide ou id manquant" });
    }
    const {
      name,
      sector,
      quantity,
      purchasePrice,
      fees,
      dividendPrice,
      dividendDate,
      history,
      priceHistory,
      dividendsHistory,
    } = req.body;

    // Conversion explicite des valeurs numériques
    const parsedQuantity = parseInt(quantity, 10);
    const parsedPurchasePrice = purchasePrice ? parseFloat(purchasePrice) : null;
    const parsedFees = fees ? parseFloat(fees) : 0;
    const parsedDividendPrice = dividendPrice ? parseFloat(dividendPrice) : null;

    const newAction = await Action.create({
      userId,
      name,
      sector,
      quantity: isNaN(parsedQuantity) ? 0 : parsedQuantity,
      purchasePrice: parsedPurchasePrice,
      fees: isNaN(parsedFees) ? 0 : parsedFees,
      dividendPrice: parsedDividendPrice,
      dividendDate: dividendDate || null,
      history,       // attend un tableau (sera converti dans le setter)
      priceHistory,  // pareil
      dividendsHistory, // pareil
    });
    res.status(201).json(newAction.get({ plain: true }));
  } catch (err) {
    console.error("Erreur création action :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'action" });
  }
});

// PUT - Mettre à jour une action
router.put("/:id", async (req, res) => {
  try {
    const userId = Number(req.user.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Token invalide ou id manquant" });
    }
    const action = await Action.findOne({ where: { id: req.params.id, userId } });
    if (!action) {
      return res.status(404).json({ error: "Action non trouvée" });
    }
    const {
      name,
      sector,
      quantity,
      purchasePrice,
      fees,
      dividendPrice,
      dividendDate,
      history,
      priceHistory,
      dividendsHistory,
    } = req.body;
    // Conversion explicite si nécessaire
    const parsedQuantity = parseInt(quantity, 10);
    const parsedPurchasePrice = purchasePrice ? parseFloat(purchasePrice) : null;
    const parsedFees = fees ? parseFloat(fees) : 0;
    const parsedDividendPrice = dividendPrice ? parseFloat(dividendPrice) : null;

    await action.update({
      name,
      sector,
      quantity: isNaN(parsedQuantity) ? 0 : parsedQuantity,
      purchasePrice: parsedPurchasePrice,
      fees: isNaN(parsedFees) ? 0 : parsedFees,
      dividendPrice: parsedDividendPrice,
      dividendDate: dividendDate || null,
      history,
      priceHistory,
      dividendsHistory,
    });
    res.json(action.get({ plain: true }));
  } catch (err) {
    console.error("Erreur mise à jour action :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'action" });
  }
});

// DELETE - Supprimer une action
router.delete("/:id", async (req, res) => {
  try {
    const userId = Number(req.user.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Token invalide ou id manquant" });
    }
    const action = await Action.findOne({ where: { id: req.params.id, userId } });
    if (!action) {
      return res.status(404).json({ error: "Action non trouvée" });
    }
    await action.destroy();
    res.json({ message: "Action supprimée avec succès" });
  } catch (err) {
    console.error("Erreur suppression action :", err);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'action" });
  }
});

module.exports = router;
