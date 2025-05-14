const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete";

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    // Vérification de la présence du token
    if (!authHeader) {
        return res.status(401).json({ 
            error: "Non autorisé", 
            message: "Token d'authentification requis" 
        });
    }

    // Validation du format Bearer
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ 
            error: "Token invalide", 
            message: "Format du token incorrect" 
        });
    }

    const token = parts[1];

    try {
        // Vérification et décodage du token avec options avancées
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'], // Limitation de l'algorithme
            maxAge: '1h' // Durée de validité maximale
        });

        // Ajout des informations utilisateur à la requête
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (err) {
        // Gestion précise des erreurs de token
        const errorResponses = {
            "TokenExpiredError": {
                status: 401,
                error: "Session expirée",
                message: "Votre session a expiré. Reconnectez-vous."
            },
            "JsonWebTokenError": {
                status: 401,
                error: "Token corrompu",
                message: "Problème d'authentification. Reconnectez-vous."
            },
            "NotBeforeError": {
                status: 401,
                error: "Token non valide",
                message: "Le token n'est pas encore utilisable."
            }
        };

        const errorResponse = errorResponses[err.name] || {
            status: 500,
            error: "Erreur d'authentification",
            message: "Un problème est survenu lors de la vérification."
        };

        return res.status(errorResponse.status).json({
            error: errorResponse.error,
            message: errorResponse.message
        });
    }
}

module.exports = verifyToken;