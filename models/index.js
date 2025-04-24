const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Connexion à la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importation des modèles
db.User = require('./User')(sequelize, DataTypes);
db.Property = require('./Property')(sequelize, DataTypes);
db.Tenant = require('./Tenant')(sequelize, DataTypes);
db.Action = require('./Action')(sequelize, DataTypes);
db.MortgageSimulation = require('./MortgageSimulation')(sequelize, DataTypes);
db.Simulation = require('./Simulation')(sequelize, DataTypes);

// Définition des associations

// --- Actions ---
db.Action.belongsTo(db.User, { foreignKey: "userId", as: "user" });
db.User.hasMany(db.Action, { foreignKey: "userId", as: "actions" });

// --- Simulations ---
db.Simulation.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Simulation, { foreignKey: 'userId' });

// --- MortgageSimulations ---
db.MortgageSimulation.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.MortgageSimulation, { foreignKey: 'userId' });

// --- Properties ---
db.Property.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Property, { foreignKey: 'userId' });

// --- Tenants ---
db.Tenant.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Tenant, { foreignKey: 'userId' });

module.exports = db;
