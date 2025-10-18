// middlewares/security.js
const express       = require("express");
const session       = require("express-session");
const rateLimit     = require("express-rate-limit");
const helmet        = require("helmet");
const xss           = require("xss-clean");
const hpp           = require("hpp");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const csurf         = require("csurf");

/* ---------- Mini filet anti-injections basique ---------- */
function sqlSanitize(req, _res, next) {
  const sanitizeValue = (value) => {
    if (typeof value === "string") {
      return value.replace(/(\%27)|(')|(--)|(\%23)|(#)|(;)/gi, "");
    }
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === "object") {
      return Object.keys(value).reduce((acc, k) => {
        acc[k] = sanitizeValue(value[k]);
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

/* ================================================================== */
/*  setupSecurity: configure toutes les protections de l’application   */
/*  👉 on reçoit FRONT_ORIGIN depuis index.js pour autoriser Netlify   */
/* ================================================================== */
function setupSecurity(app, FRONT_ORIGIN) {
  // Valeurs par défaut
  const isProd = process.env.NODE_ENV === "production";
  const frontOrigin = (FRONT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
  const allowedOrigins = new Set([
    frontOrigin,
    "http://localhost:5173",
  ]);

  // 0) Bonne pratique: l’en-tête X-Powered-By
  app.disable("x-powered-by");

  // 1) Body parser JSON limité
  app.use(express.json({ limit: "10kb" }));

  // 2) Cookies + Session (cookies compatibles cross-site en prod)
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,                     // cookie envoyé uniquement en HTTPS en prod
      sameSite: isProd ? "none" : "lax",  // indispensable si front & back ont des domaines différents
      maxAge: 1000 * 60 * 60,             // 1h
    },
  }));

  // 3) Helmet — en-têtes de sécurité
  app.use(helmet({
    // autoriser la lecture d'assets depuis des origines externes si besoin
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
        // le front va appeler l'API : on autorise l'origine du front et l'API elle-même
        connectSrc: ["'self'", frontOrigin],
        fontSrc:    ["'self'", "data:"],
        objectSrc:  ["'none'"],
        mediaSrc:   ["'self'"],
        frameSrc:   ["'none'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    frameguard: { action: "deny" },
    // pour permettre de servir /uploads à un front externe
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // 4) CORS (avec gestion dynamique de l'origine + cookies)
  const corsOptions = {
    origin(origin, cb) {
      // Autoriser aussi les requêtes sans Origin (curl/health checks)
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.has(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN"],
    exposedHeaders: ["Content-Disposition"],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // 5) Rate limiting global + endpoints sensibles
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Trop de requêtes, veuillez réessayer plus tard",
  }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Trop de tentatives, compte temporairement bloqué",
  });
  app.use(["/auth/connexion", "/auth/register"], authLimiter);

  // 6) CSRF — cookie lisible par le front (header X-XSRF-TOKEN à renvoyer)
  const csrfProtection = csurf({
    cookie: {
      httpOnly: false,                     // le front doit lire ce token
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    },
  });

  // Exemptions CSRF (garde ton comportement existant)
  app.use((req, res, next) => {
    // Simulations (exemples donnés)
    if (
      (req.method === "POST"   && req.path === "/api/simulations") ||
      (req.method === "DELETE" && req.path.startsWith("/api/simulations"))
    ) return next();

    // Auth publiques
    const openAuth = [
      "/auth/connexion",
      "/auth/register",
      "/auth/send-verification-code",
      "/auth/verify-code",
    ];
    if (req.method === "POST" && openAuth.includes(req.path)) return next();

    // CRUD propriétés / locataires (selon ton choix initial)
    if (["POST","PUT","DELETE","GET"].includes(req.method) && req.path.startsWith("/api/properties"))
      return next();
    if (["POST","PUT","DELETE","GET"].includes(req.method) && req.path.startsWith("/api/tenants"))
      return next();

    return csrfProtection(req, res, next);
  });

  // Endpoint pour récupérer le token CSRF
  app.get("/csrf-token", (req, res) => {
    const token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.json({ csrfToken: token });
  });

  // Renvoie le token à chaque réponse si disponible (facilite le refresh)
  app.use((req, res, next) => {
    if (typeof req.csrfToken === "function") {
      try {
        const t = req.csrfToken();
        res.cookie("XSRF-TOKEN", t, {
          httpOnly: false,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
        });
      } catch {}
    }
    next();
  });

  // 7) Sanitation payloads
  app.use(sqlSanitize);
  app.use(xss());
  app.use(hpp({ whitelist: ["sort", "fields", "page", "limit"] }));
}

module.exports = setupSecurity;
