// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

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

// Import des modèles existants
db.User               = require('./User')(sequelize, DataTypes);
db.Property           = require('./Property')(sequelize, DataTypes);
db.PropertyPhoto      = require('./PropertyPhoto')(sequelize, DataTypes);
db.Tenant             = require('./Tenant')(sequelize, DataTypes);
db.Action             = require('./Action')(sequelize, DataTypes);
db.MortgageSimulation = require('./MortgageSimulation')(sequelize, DataTypes);
db.Simulation         = require('./Simulation')(sequelize, DataTypes);
db.FinancialInfo      = require('./FinancialInfo')(sequelize, DataTypes);
db.Bill               = require('./Bill')(sequelize, DataTypes);
// 🔹 Nouveau
db.Work               = require('./Work')(sequelize, DataTypes);

// Associations Utilisateur ↔ Action
db.Action.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.Action, { foreignKey: 'userId', as: 'actions' });

// Associations Utilisateur ↔ Simulations
db.Simulation.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Simulation, { foreignKey: 'userId' });
db.MortgageSimulation.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.MortgageSimulation, { foreignKey: 'userId' });

// Associations Utilisateur ↔ Biens & Locataires
db.Property.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Property, { foreignKey: 'userId' });
db.Tenant.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Tenant, { foreignKey: 'userId' });

// Associations FinancialInfo ↔ Property
db.Property.hasOne(db.FinancialInfo, { foreignKey: 'propertyId', as: 'financialInfo' });
db.FinancialInfo.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property' });

// Associations Bill ↔ Property
db.Property.hasMany(db.Bill, { foreignKey: 'propertyId', as: 'bills' });
db.Bill.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property' });

// Associations PropertyPhoto ↔ Property
db.PropertyPhoto.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property' });
db.Property.hasMany(db.PropertyPhoto, { foreignKey: 'propertyId', as: 'photos' });

// 🔹 Associations Work ↔ User / Property
db.Work.belongsTo(db.User,    { foreignKey: 'userId',    as: 'user' });
db.User.hasMany(db.Work,      { foreignKey: 'userId',    as: 'works' });

db.Work.belongsTo(db.Property,{ foreignKey: 'propertyId', as: 'property' });
db.Property.hasMany(db.Work,  { foreignKey: 'propertyId', as: 'works' });


module.exports = db;
