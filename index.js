// index.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const db = require("./models");
const setupSecurity = require("./middlewares/security");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Sécurité (CORS, headers, rate-limit...)
setupSecurity(app);

// Logs
app.use(morgan("combined"));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (uploads)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Route de base
app.get("/", (req, res) => {
  res.send("Hello from the backend using MySQL, Sequelize, and enhanced security!");
});

// Auth
app.use("/auth", require("./routes/auth"));
app.use("/auth", require("./routes/authVerification"));

// Routes génériques
app.use("/api", require("./routes/SimulationRoutes"));
app.use("/api", require("./routes/items"));
app.use("/api/actions", require("./routes/actions"));
app.use("/api", require("./routes/stock_profile"));
app.use("/api", require("./routes/search_stock"));
app.use("/api/tenants", require("./routes/tenantRoutes"));

// Immobilier spécifique
app.use("/api/properties/:id/financial", require("./routes/financialRoutes"));
app.use("/api/properties/:propertyId/photos", require("./routes/propertyPhotos"));
app.use("/api/properties/:id/bills", require("./routes/billRoutes"));

// ✅ Suivi des travaux (par user & property)
app.use("/api/properties/:propertyId/works", require("./routes/work"));
app.use("/api/tasks", require("./routes/tasks")); // ⬅️ ajoute ceci

// CRUD propriétés
app.use("/api/properties", require("./routes/propertyRoutes"));

// Démarrage SAFE : pas de force/alter
async function start() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync(); // crée les tables manquantes sans altérer les existantes
    console.log("✅ Base synchronisée !");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erreur de démarrage :", err);
    process.exit(1);
  }
}
start();
