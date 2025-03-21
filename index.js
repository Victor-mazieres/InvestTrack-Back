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
  message:
    "Trop de requêtes vers /api/actions, veuillez réessayer plus tard.",
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

// Synchronisation avec { alter: true } pour mettre à jour la structure de la base en développement
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
