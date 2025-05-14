// middlewares/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Configuration de la sécurité globale pour l'application Express
function setupSecurity(app) {
    // Protection contre les attaques HTTP avec Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'deny' }
    }));

    // Configuration CORS sécurisée
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200
    }));

    // Protection contre les injections NoSQL
    app.use(mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            console.warn(`Tentative d'injection NoSQL détectée dans ${key}`);
        }
    }));

    // Protection contre les attaques XSS
    app.use(xss());

    // Protection contre la pollution des paramètres HTTP
    app.use(hpp({
        whitelist: [
            // Liste des paramètres autorisés à avoir plusieurs valeurs
            'sort', 'fields', 'page', 'limit'
        ]
    }));

    // Limitation globale des requêtes
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Limite de 1000 requêtes par fenêtre
        message: 'Trop de requêtes, veuillez réessayer plus tard',
        standardHeaders: true, // Renvoie `RateLimit-*` headers
        legacyHeaders: false, // Désactive `X-RateLimit-*` headers
        handler: (req, res, next, options) => {
            console.warn(`Limite de débit dépassée pour ${req.ip}`);
            res.status(options.statusCode).json({
                message: options.message
            });
        }
    });
    app.use(globalLimiter);

    // Limitation spécifique pour les routes sensibles
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 tentatives
        message: 'Trop de tentatives de connexion, compte temporairement bloqué',
        handler: (req, res, next, options) => {
            console.warn(`Tentatives de connexion bloquées pour ${req.ip}`);
            res.status(options.statusCode).json({
                message: options.message
            });
        }
    });

    // Appliquer le limiteur sur les routes d'authentification
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
}

module.exports = setupSecurity;

// middlewares/errorHandler.js
const winston = require('winston');
const path = require('path');

// Configuration du logger
const logger = winston.createLogger({
    level: 'warn',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Écriture des logs d'erreur dans un fichier
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        // Écriture des logs d'avertissement dans un fichier
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/warn.log'),
            level: 'warn'
        })
    ],
    // Configuration des logs pour la console en développement
    ...(process.env.NODE_ENV !== 'production' && {
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ]
    })
});

// Middleware de gestion des erreurs
function errorHandler(err, req, res, next) {
    // Log de l'erreur
    logger.error(`Erreur : ${err.message}`, {
        method: req.method,
        path: req.path,
        body: req.body,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Réponse d'erreur personnalisée
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Une erreur interne du serveur est survenue'
    });
}

module.exports = {
    logger,
    errorHandler
};