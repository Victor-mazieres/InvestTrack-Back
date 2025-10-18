// src/utils/rentCalendarStore.js

const CLE = "rentCalendarStore:v1";

/** Structure du stockage local :
{
  properties: {
    [propertyId]: { startDate: "YYYY-MM-DD", dueDay: nombre, title: "Nom du bien" }
  },
  payments: [
    { id, propertyId, date: "YYYY-MM-DD", amount: nombre, method: "texte" }
  ],
  userId: "idUtilisateur"
}
*/

// === Fonctions internes de base ===
function lire() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return { properties: {}, payments: [] };
    return JSON.parse(brut);
  } catch {
    return { properties: {}, payments: [] };
  }
}

function ecrire(state) {
  localStorage.setItem(CLE, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("rentCalendar:updated"));
}

function viderLocal() {
  localStorage.removeItem(CLE);
  window.dispatchEvent(new CustomEvent("rentCalendar:updated"));
}

// === Fonctions locales ===
export function definirConfigBien(propertyId, { startDate, dueDay, title }) {
  const st = lire();
  st.properties[propertyId] = {
    ...(st.properties[propertyId] || {}),
    ...(title ? { title } : {}),
    ...(startDate ? { startDate } : {}),
    ...(dueDay ? { dueDay: Number(dueDay) } : {}),
  };
  ecrire(st);
}

export function ajouterPaiement({ id, propertyId, date, amount, method }) {
  const st = lire();
  st.payments.unshift({
    id: id || String(Date.now()),
    propertyId,
    date,
    amount: Number(amount),
    method,
  });
  ecrire(st);
}

export function recupererTousLesEvenements({ mois = 6 } = {}) {
  const st = lire();
  const now = new Date();
  const events = [];

  // Échéances mensuelles
  for (const [propertyId, cfg] of Object.entries(st.properties)) {
    if (!cfg.startDate) continue;
    const base = new Date(cfg.startDate);
    if (isNaN(base)) continue;
    const jour = Number(cfg.dueDay || base.getDate());

    for (let i = -1; i <= mois; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, jour);
      events.push({
        type: "due",
        propertyId,
        title: `Échéance — ${cfg.title || "Bien"}`,
        date: d,
      });
    }
  }

  // Paiements
  for (const p of st.payments) {
    const d = new Date(p.date);
    if (isNaN(d)) continue;
    events.push({
      type: "payment",
      propertyId: p.propertyId,
      title: `Paiement reçu (${p.method})`,
      meta: `${Number(p.amount || 0).toFixed(2)} €`,
      date: d,
    });
  }

  return events;
}

// === Connexion au backend ===
const API = "http://localhost:5000";

async function apiGET(path, token) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

async function apiPUT(path, token, body) {
  const res = await fetch(API + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

async function apiPOST(path, token, body) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

// === Hydratation (lors de la connexion) ===
export async function hydraterDepuisServeur({ token, userId }) {
  const data = await apiGET("/api/rents/calendar", token);
  const next = {
    properties: data.properties || {},
    payments: Array.isArray(data.payments) ? data.payments : [],
    userId,
  };
  ecrire(next);
  return next;
}

// === Sauvegarde sur le backend ===
export async function enregistrerDateEcheanceServeur({ token, propertyId, startDate, dueDay }) {
  await apiPUT(`/api/rents/properties/${propertyId}/due`, token, { startDate, dueDay });
  definirConfigBien(propertyId, { startDate, dueDay });
}

export async function enregistrerPaiementServeur({ token, propertyId, date, amount, method }) {
  await apiPOST(`/api/rents/properties/${propertyId}/payments`, token, { date, amount, method });
  ajouterPaiement({ propertyId, date, amount, method });
}
