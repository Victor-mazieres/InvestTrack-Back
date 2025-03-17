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
  // autres champs de simulation...
});

Simulation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Simulation, { foreignKey: 'userId' });

module.exports = Simulation;
