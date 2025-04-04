// index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const db = require("./models"); // Ce fichier initialise Sequelize et vos modèles

// Importation de vos routes existantes
const authRoutes = require("./routes/auth");
const authVerificationRoutes = require("./routes/authVerification"); // si utilisé
const simulationRoutes = require("./routes/SimulationRoutes");
const itemsRoutes = require("./routes/items");
const actionsRoutes = require("./routes/actions");
const stockProfileRoutes = require("./routes/stock_profile");
const searchStockRoutes = require("./routes/search_stock");

// Importation de vos routes de biens immobiliers
const propertyRoutes = require("./routes/propertyRoutes");

// Nouvelle route pour les locataires
const tenantRoutes = require("./routes/tenantRoutes");

// Charger les variables d'environnement
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, veuillez réessayer plus tard.",
});
app.use(globalLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Trop de requêtes vers /api/actions, veuillez réessayer plus tard.",
});
app.use("/api/actions", apiLimiter);

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());

// Middleware pour forcer l'en-tête CORS sur le dossier uploads
app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
}, express.static('uploads'));

app.get("/", (req, res) => {
  res.send("Hello from the backend using MySQL, Sequelize, and enhanced security!");
});

// Routes d'authentification et autres routes
app.use("/auth", authRoutes);
app.use("/auth", authVerificationRoutes);
app.use("/api", simulationRoutes);
app.use("/api", itemsRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api", searchStockRoutes);
app.use("/api", stockProfileRoutes);

// Routes pour biens immobiliers et locataires
app.use("/api/properties", propertyRoutes);
app.use("/api/tenants", tenantRoutes); // Nouvelle route pour les locataires

// Synchronisation Sequelize et démarrage du serveur
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Base de données synchronisée");
    app.listen(PORT, () => {
      console.log(`Serveur en écoute sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de synchronisation de la base de données :", err);
  });
