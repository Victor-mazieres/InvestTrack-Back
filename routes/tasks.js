// routes/tasks.js
const express = require("express");
const router = express.Router();
const { Work, Property } = require("../models");

/**
 * Essaie d'obtenir userId :
 * 1) req.query.userId
 * 2) req.user.id (si middleware auth)
 */
async function resolveUserId(req) {
  if (req.query && req.query.userId && !Number.isNaN(Number(req.query.userId))) {
    return Number(req.query.userId);
  }
  if (req.user && req.user.id) return Number(req.user.id);
  return null;
}

/**
 * GET /api/tasks?status=in_progress,todo,blocked,done
 * Agrège tous les Work (rooms[].todos[]) de l'utilisateur courant, joint la Property,
 * et normalise les champs pour le frontend.
 */
router.get("/", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.json([]);
    }

    const statusParam = (req.query.status || "").split(",").map(s => s.trim()).filter(Boolean);
    const statusSet = new Set(statusParam); // si vide => pas de filtre

    // ⚠️ Bien utiliser l'alias 'property' (models/index.js : Work.belongsTo(Property, { as: "property" }))
    const works = await Work.findAll({
      where: { userId },
      include: [
        { model: Property, as: "property", attributes: ["id", "name", "address"] }
      ]
    });

    const tasks = [];

    for (const w of works) {
      const property = w.property || null;
      const propertyId = property?.id ?? w.propertyId;
      const propertyName = property?.name ?? `Bien #${propertyId}`;

      const rooms = Array.isArray(w.rooms) ? w.rooms : [];
      for (const room of rooms) {
        const roomId = room?.id ?? null;
        const roomName = room?.name ?? "Pièce";
        const todos = Array.isArray(room?.todos) ? room.todos : [];

        for (const td of todos) {
          const status =
            td.status ||
            td.state ||
            (td.done === true ? "done" : td.blocked ? "blocked" : "in_progress");

          const keep = statusParam.length === 0 ? true : statusSet.has(status);
          if (!keep) continue;

          tasks.push({
            id: td.id || `${w.id}:${roomId || "room"}:${Math.random().toString(36).slice(2)}`,
            title: td.title || td.label || td.name || "Sans titre",
            status,
            dueDate: td.dueDate || td.deadline || td.limitDate || null,
            priority: td.priority ?? null,
            assignee: td.assignee ?? td.user ?? null,

            propertyId,
            property: { id: propertyId, name: propertyName },

            roomId,
            roomName,
          });
        }
      }
    }

    // Tri : status puis dueDate
    const order = { blocked: 0, in_progress: 1, todo: 2, done: 3 };
    tasks.sort((a, b) => {
      const sa = order[a.status] ?? 99;
      const sb = order[b.status] ?? 99;
      if (sa !== sb) return sa - sb;
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

    res.json(tasks);
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    res.status(500).json({ error: "Failed to aggregate tasks" });
  }
});

module.exports = router;
