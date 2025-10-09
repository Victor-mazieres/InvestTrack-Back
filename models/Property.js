// src/models/Property.js
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Ajout : pivot côté front (LLD | LCD | AV)
    rentalKind: {
      type: DataTypes.ENUM('LLD', 'LCD', 'AV'),
      allowNull: false,
      comment: 'LLD=longue durée, LCD=courte durée, AV=achat/revente',
    },

    // Mode du bien: 'achat_revente' ou 'location' (dérivé de rentalKind)
    mode: {
      type: DataTypes.ENUM('achat_revente', 'location'),
      allowNull: false,
      comment: 'Type d’opération: achat/revente ou location',
    },

    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    surface: { type: DataTypes.FLOAT },
    propertyType: { type: DataTypes.STRING },
    building: { type: DataTypes.STRING },
    lot: { type: DataTypes.STRING },
    floor: { type: DataTypes.STRING },
    door: { type: DataTypes.STRING },

    // si tu veux garder “owner” pour locataire sur LLD/LCD
    owner: { type: DataTypes.STRING },

    acquisitionDate: { type: DataTypes.DATE },
    value: { type: DataTypes.FLOAT },
    pieces: { type: DataTypes.INTEGER },
    toilettes: { type: DataTypes.INTEGER },
    sallesDeBain: { type: DataTypes.INTEGER },
    chauffage: { type: DataTypes.STRING },
    eauChaude: { type: DataTypes.STRING },
    amenities: { type: DataTypes.JSON },

    financial: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Résultats calcul financier',
    },
  }, {
    tableName: 'properties',
    timestamps: true,
    hooks: {
      // Garantit que mode est cohérent avec rentalKind
      beforeValidate(instance) {
        const rk = String(instance.rentalKind || '').toUpperCase();
        if (rk === 'AV') instance.mode = 'achat_revente';
        else if (rk === 'LLD' || rk === 'LCD') instance.mode = 'location';
      },
    },
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
