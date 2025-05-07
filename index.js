// index.js
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan    = require("morgan");
const path      = require("path");
const db        = require("./models");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Sécurité & parsers
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limiteurs
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, veuillez réessayer plus tard.",
}));
app.use("/api/actions", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Trop de requêtes vers /api/actions, veuillez réessayer plus tard.",
}));

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

// Authentification
app.use("/auth", require("./routes/auth"));
app.use("/auth", require("./routes/authVerification"));

// Routes génériques
app.use("/api", require("./routes/SimulationRoutes"));
app.use("/api", require("./routes/items"));
app.use("/api/actions", require("./routes/actions"));
app.use("/api", require("./routes/stock_profile"));
app.use("/api", require("./routes/search_stock"));
app.use("/api/tenants", require("./routes/tenantRoutes"));

// --- Routes Immobilier, dans l'ordre spécifique ---

// 1) Données financières (upsert + fetch)
app.use(
  "/api/properties/:id/financial",
  require("./routes/financialRoutes")
);

// 2) Factures (CRUD)
app.use(
  "/api/properties/:id/bills",
  require("./routes/billRoutes")
);

// 2.5) Photos (CRUD)
app.use(
  "/api/properties",
  require("./routes/propertyPhotos")
);

// 3) CRUD complet des propriétés (après les deux précédentes)
app.use(
  "/api/properties",
  require("./routes/propertyRoutes")
);

// Sync Sequelize & lancement du serveur
db.sequelize.sync()
  .then(() => {
    console.log("✅ Base synchronisée !");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de synchronisation :", err);
  });
