// src/models/Property.js
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    surface: {
      type: DataTypes.FLOAT,
    },
    propertyType: {
      type: DataTypes.STRING,
    },
    building: {
      type: DataTypes.STRING,
    },
    lot: {
      type: DataTypes.STRING,
    },
    floor: {
      type: DataTypes.STRING,
    },
    door: {
      type: DataTypes.STRING,
    },
    owner: {
      type: DataTypes.STRING,
    },
    acquisitionDate: {
      type: DataTypes.DATE,
    },
    value: {
      type: DataTypes.FLOAT,
    },
    pieces: {
      type: DataTypes.INTEGER,
    },
    toilettes: {
      type: DataTypes.INTEGER,
    },
    sallesDeBain: {
      type: DataTypes.INTEGER,
    },
    chauffage: {
      type: DataTypes.STRING,
    },
    eauChaude: {
      type: DataTypes.STRING,
    },
    amenities: {
      type: DataTypes.JSON,
    },
    financial: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Résultats du calcul financier (émprunt, mensualité, cash-flows, etc.)',
    },
  }, {
    tableName: 'properties',
    timestamps: true,
  });

  Property.associate = models => {
    Property.hasOne(models.FinancialInfo, {
      foreignKey: 'propertyId',
      as: 'financialInfo',
      onDelete: 'CASCADE',
    });
  };

  return Property;
};
