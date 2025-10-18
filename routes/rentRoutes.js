// src/routes/rentRoutes.js
const express = require('express');
const router = express.Router();

const db = require('../models');
const auth = require('../middleware/auth'); // doit poser req.user = { id, ... }

// --------- GET /api/rents/calendar
router.get('/calendar', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const configs = await db.RentConfig.findAll({ where: { userId } });
    const payments = await db.RentPayment.findAll({
      where: { userId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    const propertyIds = Array.from(new Set(configs.map(c => c.propertyId)));
    const titles = {};
    if (propertyIds.length) {
      const props = await db.Property.findAll({
        where: { id: propertyIds },
        attributes: ['id', 'name'],
      });
      props.forEach(p => { titles[p.id] = p.name; });
    }

    const properties = {};
    configs.forEach(c => {
      properties[c.propertyId] = {
        startDate: c.startDate,
        dueDay: c.dueDay,
        title: titles[c.propertyId] || null,
      };
    });

    res.json({ properties, payments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --------- PUT /api/rents/properties/:propertyId/due
router.put('/properties/:propertyId/due', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = Number(req.params.propertyId);
    const { startDate, dueDay } = req.body;

    if (!startDate && (dueDay == null)) {
      return res.status(400).json({ message: "startDate ou dueDay requis" });
    }

    const [row, created] = await db.RentConfig.findOrCreate({
      where: { userId, propertyId },
      defaults: {
        userId,
        propertyId,
        startDate: startDate || new Date().toISOString().slice(0,10),
        dueDay: Number(dueDay ?? new Date(startDate).getDate() || 1),
      },
    });

    if (!created) {
      if (startDate) row.startDate = startDate;
      if (dueDay != null) row.dueDay = Number(dueDay);
      await row.save();
    }

    res.json({ id: row.id, userId, propertyId, startDate: row.startDate, dueDay: row.dueDay });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --------- POST /api/rents/properties/:propertyId/payments
router.post('/properties/:propertyId/payments', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = Number(req.params.propertyId);
    const { date, amount, method, note } = req.body;

    if (!date || !amount || !method) {
      return res.status(400).json({ message: "date, amount, method requis" });
    }

    const payment = await db.RentPayment.create({
      userId,
      propertyId,
      date,
      amount: Number(amount),
      method,
      note: note || null,
    });

    res.status(201).json(payment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --------- GET /api/rents/properties/:propertyId/payments
router.get('/properties/:propertyId/payments', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = Number(req.params.propertyId);
    const rows = await db.RentPayment.findAll({
      where: { userId, propertyId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
