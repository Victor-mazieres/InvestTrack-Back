// src/models/index.js
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

/* ====== Imports modèles ====== */
db.User               = require('./User')(sequelize, DataTypes);
db.Property           = require('./Property')(sequelize, DataTypes);
db.PropertyPhoto      = require('./PropertyPhoto')(sequelize, DataTypes);
db.Tenant             = require('./Tenant')(sequelize, DataTypes);
db.Action             = require('./Action')(sequelize, DataTypes);
db.MortgageSimulation = require('./MortgageSimulation')(sequelize, DataTypes);
db.Simulation         = require('./Simulation')(sequelize, DataTypes);
db.Bill               = require('./Bill')(sequelize, DataTypes);
db.Work               = require('./Work')(sequelize, DataTypes);
db.FinancialInfoLLD   = require('./FinancialInfoLLD')(sequelize, DataTypes);
db.FinancialInfoLCD   = require('./FinancialInfoLCD')(sequelize, DataTypes);

// ✅ NOUVEAUX
db.RentConfig         = require('./RentConfig')(sequelize, DataTypes);
db.RentPayment        = require('./RentPayment')(sequelize, DataTypes);

/* ====== Associations ====== */
// User ↔ Action
db.Action.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.Action,   { foreignKey: 'userId', as: 'actions' });

// User ↔ Simulations
db.Simulation.belongsTo(db.User,         { foreignKey: 'userId' });
db.User.hasMany(db.Simulation,           { foreignKey: 'userId' });
db.MortgageSimulation.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.MortgageSimulation,   { foreignKey: 'userId' });

// User ↔ Property / Tenant
db.Property.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Property,   { foreignKey: 'userId' });

db.Tenant.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Tenant,   { foreignKey: 'userId' });

// Property ↔ Financial (LLD/LCD)
db.Property.hasOne(db.FinancialInfoLLD, { foreignKey: 'propertyId', as: 'financialLld' });
db.Property.hasOne(db.FinancialInfoLCD, { foreignKey: 'propertyId', as: 'financialCld' });
db.FinancialInfoLLD.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });
db.FinancialInfoLCD.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });

// Property ↔ Bill
db.Property.hasMany(db.Bill, { foreignKey: 'propertyId', as: 'bills' });
db.Bill.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });

// Property ↔ Photos
db.PropertyPhoto.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });
db.Property.hasMany(db.PropertyPhoto,   { foreignKey: 'propertyId', as: 'photos' });

// Work
db.Work.belongsTo(db.User,     { foreignKey: 'userId',    as: 'user' });
db.User.hasMany(db.Work,       { foreignKey: 'userId',    as: 'works' });
db.Work.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });
db.Property.hasMany(db.Work,   { foreignKey: 'propertyId', as: 'works' });

// ✅ Loyers
db.Property.hasOne(db.RentConfig, { foreignKey: 'propertyId', as: 'rentConfig', onDelete: 'CASCADE' });
db.RentConfig.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });

db.Property.hasMany(db.RentPayment, { foreignKey: 'propertyId', as: 'rentPayments', onDelete: 'CASCADE' });
db.RentPayment.belongsTo(db.Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });

db.RentConfig.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.RentConfig, { foreignKey: 'userId', as: 'rentConfigs' });

db.RentPayment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.RentPayment, { foreignKey: 'userId', as: 'rentPayments' });

module.exports = db;
