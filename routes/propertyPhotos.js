// src/routes/propertyPhotos.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { PropertyPhoto } = require('../models');

// GET toutes les photos d’un bien
router.get('/:propertyId/photos', async (req, res, next) => {
  const { propertyId } = req.params;
  const photos = await PropertyPhoto.findAll({ where: { propertyId } });
  res.json(photos);
});

// POST upload d’une photo
router.post('/:propertyId/photos', upload.single('photo'), async (req, res, next) => {
  const { propertyId } = req.params;
  const url = `/uploads/properties/${req.file.filename}`;
  const photo = await PropertyPhoto.create({ propertyId, url, caption: req.body.caption });
  res.status(201).json(photo);
});

// DELETE une photo
router.delete('/photos/:id', async (req, res, next) => {
  const { id } = req.params;
  await PropertyPhoto.destroy({ where: { id } });
  res.status(204).end();
});

module.exports = router;
