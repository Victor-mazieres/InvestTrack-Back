const express = require("express");
const router = express.Router();
const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Route pour obtenir le profil précis d'une action (secteur, etc.)
router.get("/stock_profile/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const url = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/modules";
  const headers = {
    "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
    "x-rapidapi-key": RAPIDAPI_KEY,
  };
  const params = {
    ticker: symbol,
    module: "asset-profile",
  };

  try {
    const { data } = await axios.get(url, { headers, params });

    const profile = data.body || {};

    const assetProfile = profile["assetProfile"] || {};

    const result = {
      sector: assetProfile.sector || "",
      industry: assetProfile.industry || "",
      description: assetProfile.longBusinessSummary || "",
      website: assetProfile.website || "",
    };

    return res.json(result);
  } catch (error) {
    console.error("Erreur récupération profil Yahoo Finance:", error.message);
    return res.status(500).json({ error: "Impossible de récupérer le profil de l'action." });
  }
});

module.exports = router;
