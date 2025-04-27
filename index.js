// index.js
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan    = require("morgan");
const db        = require("./models");           // Sequelize + modèles
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Sécurité & parsers ───────────────────────────────────────────────────────
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

// ─── Limiteurs ────────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, veuillez réessayer plus tard.",
});
app.use(globalLimiter);

const actionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Trop de requêtes vers /api/actions, veuillez réessayer plus tard.",
});
app.use("/api/actions", actionsLimiter);

// ─── Fichiers statiques (uploads) ────────────────────────────────────────────
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    next();
  },
  express.static("uploads")
);

// ─── Routes de base ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Hello from the backend using MySQL, Sequelize, and enhanced security!");
});

// ─── Authentification et API principales ─────────────────────────────────────
app.use("/auth", require("./routes/auth"));
app.use("/auth", require("./routes/authVerification"));

// Vos routes existantes
app.use("/api", require("./routes/SimulationRoutes"));
app.use("/api", require("./routes/items"));
app.use("/api/actions", require("./routes/actions"));
app.use("/api", require("./routes/stock_profile"));
app.use("/api", require("./routes/search_stock"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/tenants", require("./routes/tenantRoutes"));

// ─── Nouvelle route financière ───────────────────────────────────────────────
app.use("/api", require("./routes/financialRoutes")); // <-- ajouté ici

// ─── Sync Sequelize & lancement du serveur ───────────────────────────────────
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
