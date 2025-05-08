const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Format du token invalide" });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erreur verifyToken:", err);

    if (err.name === "TokenExpiredError") {
      // cas où le token a bien été signé mais est expiré
      return res.status(401).json({ error: "Token expiré, veuillez vous reconnecter." });
    }

    if (err.name === "JsonWebTokenError") {
      // cas de token mal formé, signature invalide, etc.
      return res.status(401).json({ error: "Token invalide." });
    }

    // toute autre erreur
    return res.status(500).json({ error: "Erreur serveur lors de la vérification du token." });
  }
}

module.exports = verifyToken;
