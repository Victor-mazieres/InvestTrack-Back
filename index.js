// === index.js ===
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const authVerificationRoutes = require('./routes/authVerification');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend using MySQL, Sequelize, and enhanced security!');
});

// Routes d'authentification
app.use('/auth', authRoutes);
// Routes de vérification d'e-mail
app.use('/auth', authVerificationRoutes);

sequelize.sync()
  .then(() => {
    console.log('Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`Serveur en écoute sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de synchronisation de la base de données :', err);
  });
