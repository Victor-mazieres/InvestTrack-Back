// routes/auth.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { User } = require('../models');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

// --- Configuration du transporteur mail (Mailtrap) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                          // ex. smtp.mailtrap.io
  port: parseInt(process.env.SMTP_PORT, 10),            // ex. 2525
  secure: false,                                        // false pour Mailtrap
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,                          // ignore les erreurs de certificat
  },
});


// --- Inscription ---
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username est requis"),
    body("pin").isLength({ min: 6, max: 6 }).withMessage("Le PIN doit comporter 6 chiffres"),
    body("email").optional().isEmail().withMessage("E-mail invalide"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Données invalides", errors: errors.array() });
      }
      const { username, pin, email, country, address, city, postalCode } = req.body;
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
        // emailVerified, verifyCode et codeExpires prennent leurs valeurs par défaut
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
          emailVerified: user.emailVerified,
        },
      });
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// --- Connexion ---
router.post(
  "/connexion",
  [
    body("username").notEmpty().withMessage("Username est requis"),
    body("pin").isLength({ min: 6, max: 6 }).withMessage("Le PIN doit comporter 6 chiffres"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Données invalides", errors: errors.array() });
      }
      const { username, pin } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user || !(await bcrypt.compare(pin, user.password))) {
        return res.status(400).json({ message: "Identifiants invalides" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
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
          emailVerified: user.emailVerified,
        },
      });
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// --- Middleware d'authentification ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Accès refusé, format du token invalide" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// --- Envoi du code de vérification par e-mail ---
router.post(
  "/send-verification-code",
  authMiddleware,
  body("email").isEmail().withMessage("E-mail invalide"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Email invalide", errors: errors.array() });
      }
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      // Génération du code et de sa date d'expiration
      const code = ("000000" + Math.floor(Math.random() * 1e6)).slice(-6);
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Sauvegarde en base
      await user.update({
        email: req.body.email,
        verifyCode: code,
        codeExpires: expires,
        emailVerified: false,
      });

      // Envoi du mail
      await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to:      req.body.email,
        subject: "Votre code de vérification InvestTrack",
        text:    `Votre code est ${code}. Il expire dans 15 minutes.`,
      });

      res.json({ message: "Code envoyé" });
    } catch (err) {
      console.error("Erreur envoi code:", err);
      res.status(500).json({ message: "Erreur serveur lors de l’envoi" });
    }
  }
);

// --- Vérification du code ---
router.post(
  "/verify-code",
  authMiddleware,
  [
    body("email").isEmail(),
    body("code").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      if (user.email !== email) {
        return res.status(400).json({ message: "E-mail non reconnu" });
      }
      if (user.verifyCode !== code) {
        return res.status(400).json({ message: "Code invalide" });
      }
      if (user.codeExpires < new Date()) {
        return res.status(400).json({ message: "Code expiré" });
      }

      // Marquer l’e-mail comme vérifié et nettoyer
      await user.update({
        emailVerified: true,
        verifyCode:    null,
        codeExpires:   null,
      });

      res.json({ message: "Adresse e-mail vérifiée" });
    } catch (err) {
      console.error("Erreur vérif code:", err);
      res.status(500).json({ message: "Erreur serveur lors de la vérification" });
    }
  }
);

// --- Lecture du profil (expose emailVerified) ---
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "verifyCode", "codeExpires"] }
    });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    console.error("Erreur profile:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --- Mise à jour du profil / PIN ---
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.pin) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      updateData.password = await bcrypt.hash(updateData.pin, saltRounds);
      delete updateData.pin;
    }
    await User.update(updateData, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "verifyCode", "codeExpires"] }
    });
    res.json({ message: "Profil mis à jour", user: updatedUser });
  } catch (err) {
    console.error("Erreur update profile:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
