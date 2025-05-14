// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Assurez-vous d'avoir un modèle User

/**
 * Middleware d'authentification avancé
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction de middleware suivante
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Vérification de la présence du header d'autorisation
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Accès refusé', 
                message: 'Aucun token fourni' 
            });
        }

        // Vérification du format du header (Bearer Token)
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                error: 'Format du token invalide', 
                message: 'Le token doit être au format Bearer' 
            });
        }

        // Extraction du token
        const token = parts[1];

        // Vérification et décodage du token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'], // Limitation de l'algorithme
            });
        } catch (err) {
            // Gestion détaillée des erreurs de token
            switch (err.name) {
                case 'TokenExpiredError':
                    return res.status(401).json({ 
                        error: 'Token expiré', 
                        message: 'Votre session a expiré. Veuillez vous reconnecter.' 
                    });
                case 'JsonWebTokenError':
                    return res.status(401).json({ 
                        error: 'Token invalide', 
                        message: 'Le token fourni est incorrect ou a été altéré.' 
                    });
                case 'NotBeforeError':
                    return res.status(401).json({ 
                        error: 'Token pas encore valide', 
                        message: 'Le token n\'est pas encore utilisable.' 
                    });
                default:
                    return res.status(500).json({ 
                        error: 'Erreur de vérification', 
                        message: 'Un problème est survenu lors de la vérification du token.' 
                    });
            }
        }

        // Vérification supplémentaire en base de données
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
          });
          if (!user) {
            return res.status(401).json({
              error: 'Utilisateur non trouvé',
              message: 'L’utilisateur associé à ce token n’existe plus.'
            });
          }

        // Vérification du statut du compte
        if (user.isAccountLocked || user.isDeleted) {
            return res.status(403).json({ 
                error: 'Compte bloqué', 
                message: 'Votre compte a été bloqué ou supprimé.' 
            });
        }

        // Ajout de l'utilisateur à l'objet de requête
        req.user = user;
        req.token = token;

        // Passage au middleware suivant
        next();
    } catch (error) {
        // Gestion des erreurs inattendues
        console.error('Erreur dans le middleware d\'authentification:', error);
        res.status(500).json({ 
            error: 'Erreur serveur', 
            message: 'Une erreur inattendue est survenue.' 
        });
    }
};

/**
 * Middleware pour vérifier les rôles de l'utilisateur
 * @param {string[]} roles - Rôles autorisés
 * @returns {Function} Middleware de vérification de rôle
 */
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        // Vérification que l'utilisateur a un rôle autorisé
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Accès interdit', 
                message: 'Vous n\'avez pas les permissions nécessaires.' 
            });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    roleMiddleware
};