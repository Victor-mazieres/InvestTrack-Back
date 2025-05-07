// src/routes/billRoutes.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { Bill, Property } = require('../models');
const router  = express.Router({ mergeParams: true });

// Prépare l'upload dans uploads/bills
const uploadDir = path.join(__dirname, '../uploads/bills');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random()*1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// GET  /api/properties/:id/bills
router.get('/', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const bills = await Bill.findAll({
      where: { propertyId },
      order: [['date','DESC']],
    });
    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/properties/:id/bills
// champs attendus : title, amount, file (multipart/form-data)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const { title, amount } = req.body;
    if (!title)  return res.status(400).json({ error: 'Missing title' });
    if (!amount) return res.status(400).json({ error: 'Missing amount' });
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    const fileUrl = `/uploads/bills/${req.file.filename}`;
    const parsedAmount = parseFloat(amount);

    const bill = await Bill.create({ propertyId, title, amount: parsedAmount, fileUrl });
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/properties/:id/bills/:billId
router.delete('/:billId', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const billId     = parseInt(req.params.billId, 10);

    const prop = await Property.findByPk(propertyId);
    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const bill = await Bill.findOne({ where: { id: billId, propertyId } });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    // Supprime le fichier physiquement (optionnel)
    const filePath = path.join(__dirname, '../', bill.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await bill.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
