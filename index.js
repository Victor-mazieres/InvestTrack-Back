// index.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const db = require("./models");
const setupSecurity = require("./middlewares/security");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const FRONT_ORIGIN = (process.env.FRONT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");

setupSecurity(app, FRONT_ORIGIN);

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", FRONT_ORIGIN);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN");
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (_req, res) => res.send("Hello from the backend using Sequelize with enhanced security!"));
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Auth
app.use("/auth", require("./routes/auth"));
app.use("/auth", require("./routes/authVerification"));

// API existantes
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api", require("./routes/SimulationRoutes"));
app.use("/api", require("./routes/items"));
app.use("/api/actions", require("./routes/actions"));
app.use("/api", require("./routes/stock_profile"));
app.use("/api", require("./routes/search_stock"));
app.use("/api/tenants", require("./routes/tenantRoutes"));
app.use("/api/properties/:id/financial/lcd", require("./routes/financialLcdRoutes"));
app.use("/api/properties/:id/financial/lld", require("./routes/financialLldRoutes"));
app.use("/api/properties/:propertyId/photos", require("./routes/propertyPhotos"));
app.use("/api/properties/:id/bills", require("./routes/billRoutes"));
app.use("/api/properties/:propertyId/works", require("./routes/work"));
app.use("/api/tasks", require("./routes/tasks"));

// 💡 AJOUT: routes loyers
app.use("/api/rents", require("./routes/rentRoutes"));

async function start() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync(); // en prod, privilégie migrations
    console.log("✅ Base synchronisée !");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur ${PORT}`);
      console.log(`🌍 Front autorisé: ${FRONT_ORIGIN}`);
    });
  } catch (err) {
    console.error("❌ Erreur de démarrage :", err);
    process.exit(1);
  }
}
start();
