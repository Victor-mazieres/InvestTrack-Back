// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erreur verifyToken:", err);
    return res.status(401).json({ error: "Token invalide" });
  }
}

module.exports = verifyToken;
