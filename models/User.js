// === models/User.js ===
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: {
      args: true,
      msg: 'Ce nom d\'utilisateur est déjà utilisé.'
    }
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  country: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  address: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  city: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  postalCode: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
