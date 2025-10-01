// middlewares/security.js
const express       = require('express');
const session       = require('express-session');
const rateLimit     = require('express-rate-limit');
const helmet        = require('helmet');
const xss           = require('xss-clean');
const hpp           = require('hpp');
const cors          = require('cors');
const cookieParser  = require('cookie-parser');
const csurf         = require('csurf');

// Protection basique contre les injections SQL (filet de secours).
 
function sqlSanitize(req, res, next) {
  const sanitizeValue = value => {
    if (typeof value === 'string') {
      return value.replace(/(\%27)|(\')|(\-\-)|(\%23)|(#)|(\;)/gi, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).reduce((acc, key) => {
        acc[key] = sanitizeValue(value[key]);
        return acc;
      }, {});
    }
    return value;
  };

  req.body   = sanitizeValue(req.body);
  req.query  = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
}

//Configure l'ensemble des protections de sécurité de l'application.
 
function setupSecurity(app) {
  // 0) Désactiver X-Powered-By
  app.disable('x-powered-by');

  // 1) Body parser JSON limité
  app.use(express.json({ limit: '10kb' }));

  // 2) Cookie parser + Session
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 // 1 heure
    }
  }));

  // 3) Helmet pour en-têtes HTTP sécurisées
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.API_DOMAIN || "'self'"],
        fontSrc:    ["'self'"],
        objectSrc:  ["'none'"],
        mediaSrc:   ["'self'"],
        frameSrc:   ["'none'"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' }
  }));

  // 4) CORS sécurisé + preflight
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:5173'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-XSRF-TOKEN'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // 5) Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    standardHeaders: true,
    legacyHeaders: false
  }));
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Trop de tentatives, compte temporairement bloqué',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(['/auth/connexion', '/auth/register'], authLimiter);

  // 6) CSRF protection
  const csrfProtection = csurf({
    cookie: {
      httpOnly: false, // front peut lire
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  });

  app.use((req, res, next) => {
    // Exempter POST /api/simulations et DELETE /api/simulations/:id
    if (
      (req.method === 'POST' && req.path === '/api/simulations') ||
      (req.method === 'DELETE' && req.path.startsWith('/api/simulations'))
    ) {
      return next();
    }
    // Exempter routes d'auth publiques
    const openAuth = [
      '/auth/connexion', '/auth/register',
      '/auth/send-verification-code', '/auth/verify-code'
    ];
    if (req.method === 'POST' && openAuth.includes(req.path)) {
      return next();
    }
    // Exempter CRUD propriétés
    if (['POST','PUT','DELETE','GET'].includes(req.method) && req.path.startsWith('/api/properties')) {
      return next();
    }
    // Exempter CRUD locataires
    if (['POST','PUT','DELETE','GET'].includes(req.method) && req.path.startsWith('/api/tenants')) {
      return next();
    }
    // Appliquer CSRF pour les autres
    return csrfProtection(req, res, next);
  });

  // Route pour récupérer un token CSRF
  app.get('/csrf-token', (req, res) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ csrfToken: token });
  });

  // Renvoi du CSRF dans un cookie à chaque réponse
  app.use((req, res, next) => {
    if (req.csrfToken) {
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
    }
    next();
  });

  // Gestion des erreurs CSRF
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next(err);
  });

  // 7) Sanitation & protection payload
  app.use(sqlSanitize);
  app.use(xss());
  app.use(hpp({ whitelist: ['sort','fields','page','limit'] }));
}

module.exports = setupSecurity;