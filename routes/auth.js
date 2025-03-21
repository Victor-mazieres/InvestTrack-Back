// routes/auth.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

// Inscription
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username est requis"),
    body("pin")
      .isLength({ min: 6, max: 6 })
      .withMessage("Le PIN doit comporter 6 chiffres"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Données invalides", errors: errors.array() });
      }
      const { username, pin, email, country, address, city, postalCode } =
        req.body;
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: "Utilisateur déjà existant" });
      }
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      const hashedPin = await bcrypt.hash(pin, saltRounds);
      const user = await User.create({
        username,
        password: hashedPin,
        email: email || null,
        country: country || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
      });
      res.status(201).json({
        message: "Inscription réussie",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          country: user.country,
          address: user.address,
          city: user.city,
          postalCode: user.postalCode,
        },
      });
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Connexion
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username est requis"),
    body("pin")
      .isLength({ min: 6, max: 6 })
      .withMessage("Le PIN doit comporter 6 chiffres"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Données invalides", errors: errors.array() });
      }
      const { username, pin } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(400).json({ message: "Identifiants invalides" });
      }
      const isMatch = await bcrypt.compare(pin, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Identifiants invalides" });
      }
      // Génération du token incluant l'id et l'email (si disponible)
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          country: user.country,
          address: user.address,
          city: user.city,
          postalCode: user.postalCode,
        },
      });
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// Middleware d'authentification utilisé pour les routes protégées
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res
      .status(401)
      .json({ message: "Accès refusé, aucun token fourni" });
  const token = authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Accès refusé, format du token invalide" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.pin) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updateData.password = await bcrypt.hash(updateData.pin, saltRounds);
      delete updateData.pin;
    }
    await User.update(updateData, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ message: "Profil mis à jour", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
