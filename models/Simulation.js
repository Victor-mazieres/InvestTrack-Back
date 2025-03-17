// === models/Simulation.js ===
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Simulation = sequelize.define('Simulation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  propertyPrice: DataTypes.FLOAT,
  personalContribution: DataTypes.FLOAT,
  loanFees: DataTypes.FLOAT,
  propertyTax: DataTypes.FLOAT,
  syndicFees: DataTypes.FLOAT,
  ownerInsuranceAmount: DataTypes.FLOAT,
  loanDuration: DataTypes.FLOAT,
  interestRate: DataTypes.STRING,
  insuranceRate: DataTypes.STRING,
  monthlyRent: DataTypes.FLOAT,
  monthlyCharges: DataTypes.FLOAT,
  // Stockage des résultats calculés (optionnel) en JSON
  results: DataTypes.JSON,
}, {
  tableName: 'simulations',
  timestamps: true,
});

// Association : Une simulation appartient à un utilisateur
Simulation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Simulation, { foreignKey: 'userId' });

module.exports = Simulation;
