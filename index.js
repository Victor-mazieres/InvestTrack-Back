// index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const sequelize = require("./config/database");

const authRoutes = require("./routes/auth");
const authVerificationRoutes = require("./routes/authVerification"); // si utilisé
const simulationRoutes = require("./routes/SimulationRoutes");
const itemsRoutes = require("./routes/items");
const actionsRoutes = require("./routes/actions");
const stockProfileRoutes = require("./routes/stock_profile");
const searchStockRoutes = require("./routes/search_stock");

// Charger les variables d'environnement
require("dotenv").config();

const app = express(); // ← Déclare "app" ici avant d'utiliser app.use()

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

app.get("/", (req, res) => {
  res.send(
    "Hello from the backend using MySQL, Sequelize, and enhanced security!"
  );
});

// Routes d'authentification et autres routes
app.use("/auth", authRoutes);
app.use("/auth", authVerificationRoutes); // si applicable
app.use("/api", simulationRoutes);
app.use("/api", itemsRoutes);
app.use("/api/actions", actionsRoutes);

// Routes Yahoo Finance
app.use("/api", searchStockRoutes);
app.use("/api", stockProfileRoutes); // ← cette ligne doit être ici après la déclaration de "app"

// Synchronisation Sequelize
sequelize
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
