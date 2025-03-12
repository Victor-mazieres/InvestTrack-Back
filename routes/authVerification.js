const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Assurez-vous que votre modèle User est exporté correctement
const { authMiddleware } = require('../middlewares/authMiddleware'); // Middleware pour authentifier l'utilisateur
const router = express.Router();

// Stockage temporaire des codes de vérification par e-mail (pour la démo)
const verificationCodes = {};

// Configuration du transporteur Nodemailer (utilisez vos variables d'environnement)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // par exemple : smtp.example.com
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,                      // true pour le port 465, false pour les autres
  auth: {
    user: process.env.SMTP_USER,      // votre utilisateur SMTP
    pass: process.env.SMTP_PASS,      // votre mot de passe SMTP
  },
});

// Endpoint pour envoyer le code de vérification
router.post('/send-verification-code', authMiddleware, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "L'adresse e-mail est requise." });
  }
  
  // Génération d'un code à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Stockage du code avec une validité de 10 minutes
  verificationCodes[email] = {
    code,
    expires: Date.now() + 10 * 60 * 1000,
  };

  const mailOptions = {
    from: process.env.FROM_EMAIL || "no-reply@example.com",
    to: email,
    subject: "Votre code de vérification",
    text: `Votre code de vérification est : ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Code envoyé avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'e-mail :", err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail." });
  }
});

// Endpoint pour vérifier le code et mettre à jour l'adresse e-mail dans le profil
router.post('/verify-code', authMiddleware, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "L'e-mail et le code sont requis." });
  }
  const record = verificationCodes[email];
  if (!record) {
    return res.status(400).json({ message: "Aucun code envoyé pour cet e-mail." });
  }
  if (Date.now() > record.expires) {
    delete verificationCodes[email];
    return res.status(400).json({ message: "Le code a expiré." });
  }
  if (record.code !== code) {
    return res.status(400).json({ message: "Code invalide." });
  }

  // Code validé : mise à jour de l'adresse e-mail de l'utilisateur connecté
  try {
    await User.update({ email }, { where: { id: req.user.id } });
    // Supprimer le code pour garantir une utilisation unique
    delete verificationCodes[email];
    res.json({ message: "Adresse e-mail vérifiée et mise à jour avec succès." });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'e-mail :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'e-mail." });
  }
});

module.exports = router;
