// utils/cacheManager.js
const NodeCache = require('node-cache');
const Redis = require('ioredis');
const { promisify } = require('util');

// Déterminer si Redis est configuré dans les variables d'environnement
const useRedis = process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT);

// Configuration par défaut
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || 3600); // 1 heure en secondes
const CACHE_CHECK_PERIOD = parseInt(process.env.CACHE_CHECK_PERIOD || 600); // 10 minutes

// Créer l'instance de cache appropriée
let cacheClient;
let asyncGet, asyncSet, asyncDel, asyncFlush;

if (useRedis) {
  try {
    // Configuration Redis
    const redisConfig = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };
    
    // Si une URL complète est fournie, l'utiliser à la place
    cacheClient = process.env.REDIS_URL 
      ? new Redis(process.env.REDIS_URL) 
      : new Redis(redisConfig);
    
    // Promisify les méthodes Redis
    asyncGet = async (key) => {
      const result = await cacheClient.get(key);
      return result ? JSON.parse(result) : null;
    };
    
    asyncSet = (key, value, ttl = DEFAULT_TTL) => 
      cacheClient.set(key, JSON.stringify(value), 'EX', ttl);
    
    asyncDel = (key) => cacheClient.del(key);
    
    asyncFlush = () => cacheClient.flushdb();
    
    console.log('Cache Redis initialisé');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Redis, retour au cache en mémoire:', error);
    useRedisCache = false;
  }
}

// Fallback à NodeCache si Redis n'est pas configuré ou en cas d'erreur
if (!useRedis || !cacheClient) {
  cacheClient = new NodeCache({
    stdTTL: DEFAULT_TTL,
    checkperiod: CACHE_CHECK_PERIOD,
    useClones: false
  });
  
  asyncGet = async (key) => cacheClient.get(key);
  asyncSet = (key, value, ttl = DEFAULT_TTL) => cacheClient.set(key, value, ttl);
  asyncDel = (key) => cacheClient.del(key);
  asyncFlush = () => cacheClient.flushAll();
  
  console.log('Cache en mémoire (NodeCache) initialisé');}