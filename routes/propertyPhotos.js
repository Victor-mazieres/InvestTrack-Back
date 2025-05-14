const express = require('express');
const router  = express.Router({ mergeParams: true }); // pour récupérer req.params.propertyId
const upload  = require('../middlewares/upload');
const { PropertyPhoto } = require('../models');

// GET toutes les photos d’un bien
router.get('/', async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const photos = await PropertyPhoto.findAll({ where: { propertyId } });
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

// POST upload d’une photo
router.post('/',
  upload.single('photo'),
  async (req, res, next) => {
    try {
      const { propertyId } = req.params;
      const url = `/uploads/properties/${req.file.filename}`;
      const photo = await PropertyPhoto.create({
        propertyId,
        url,
        caption: req.body.caption
      });
      res.status(201).json(photo);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE une photo par son id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await PropertyPhoto.destroy({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
