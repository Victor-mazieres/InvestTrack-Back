const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }
  
  // Vérifier que le header est au format "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Format du token invalide" });
  }
  
  const token = parts[1];
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
