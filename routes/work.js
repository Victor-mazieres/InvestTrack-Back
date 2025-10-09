// routes/work.js
const express = require("express");
const { Work, Property } = require("../models");

const router = express.Router({ mergeParams: true });

/**
 * Essaie d'obtenir userId de 3 façons :
 * 1) req.query.userId
 * 2) req.user.id (si ton middleware auth le remplit)
 * 3) via la propriété : Property.userId
 */
async function resolveUserId(req) {
  // 1) via query
  if (req.query && req.query.userId && !Number.isNaN(Number(req.query.userId))) {
    return Number(req.query.userId);
  }
  // 2) via auth middleware
  if (req.user && req.user.id) return Number(req.user.id);

  // 3) via la propriété
  const propertyId = Number(req.params.propertyId);
  if (!propertyId) return null;

  try {
    const prop = await Property.findByPk(propertyId, { attributes: ["id", "userId"] });
    if (prop && prop.userId) return Number(prop.userId);
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * GET /api/properties/:propertyId/works
 * Renvoie le Work pour (userId, propertyId).
 * Si aucun doc, renvoie un shell vide pour ne pas planter le front.
 */
router.get("/", async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    if (!propertyId) return res.status(400).json({ message: "propertyId invalide" });

    const userId = await resolveUserId(req);
    if (!userId) {
      // On ne jette pas 401 : on renvoie un shell vide pour que l’UI reste utilisable
      return res.json({ id: null, userId: null, propertyId, rooms: [] });
    }

    const work = await Work.findOne({ where: { userId, propertyId } });
    if (!work) {
      return res.json({ id: null, userId, propertyId, rooms: [] });
    }
    return res.json(work);
  } catch (err) {
    console.error("Erreur GET works:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * PUT /api/properties/:propertyId/works
 * Body: { rooms: [...] } — upsert par (userId, propertyId)
 */
router.put("/", async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const { rooms } = req.body;

    if (!propertyId) return res.status(400).json({ message: "propertyId invalide" });
    if (!Array.isArray(rooms)) return res.status(400).json({ message: "rooms invalide" });

    const userId = await resolveUserId(req);
    if (!userId) return res.status(401).json({ message: "Non authentifié" });

    const existing = await Work.findOne({ where: { userId, propertyId } });

    if (!existing) {
      const created = await Work.create({ userId, propertyId, rooms });
      return res.json(created);
    } else {
      existing.rooms = rooms;
      await existing.save();
      return res.json(existing);
    }
  } catch (err) {
    console.error("Erreur PUT works:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
