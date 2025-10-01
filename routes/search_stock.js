const express = require("express");
const router = express.Router();
const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

router.get("/search_stock", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  const url = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/search";
  const headers = {
    "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
    "x-rapidapi-key": RAPIDAPI_KEY,
  };
  const params = { search: query };

  try {
    const { data } = await axios.get(url, { headers, params });

    const suggestions = Array.isArray(data.body) ? data.body : [];

    const formattedSuggestions = suggestions.map((item) => ({
      symbol: item.symbol,
      name: item.shortname || item.longname || item.symbol,
      sector: item.sector || "",
      dividendPrice: null,
      dividendDate: null,
    }));

    return res.json(formattedSuggestions);
  } catch (error) {
    console.error("Erreur complète Yahoo Finance API:", {
      message: error.message,
      responseData: error.response?.data,
    });
    return res.status(500).json({ error: "Impossible de récupérer les suggestions." });
  }
});

module.exports = router;