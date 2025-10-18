// src/models/Property.js
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Pivot côté front (LLD | LCD | AV)
    rentalKind: {
      type: DataTypes.ENUM('LLD', 'LCD', 'AV'),
      allowNull: false,
      comment: 'LLD=longue durée, LCD=courte durée, AV=achat/revente',
    },

    // Dérivé de rentalKind
    mode: {
      type: DataTypes.ENUM('achat_revente', 'location'),
      allowNull: false,
      comment: 'Type d’opération: achat/revente ou location',
    },

    name:        { type: DataTypes.STRING, allowNull: false },
    address:     { type: DataTypes.STRING },
    postalCode:  { type: DataTypes.STRING },
    city:        { type: DataTypes.STRING },
    surface:     { type: DataTypes.FLOAT },
    propertyType:{ type: DataTypes.STRING },
    building:    { type: DataTypes.STRING },
    lot:         { type: DataTypes.STRING },
    floor:       { type: DataTypes.STRING },
    door:        { type: DataTypes.STRING },

    // ex “owner” (souvent id locataire dans ton app)
    owner: { type: DataTypes.STRING },

    acquisitionDate: { type: DataTypes.DATE },
    value:           { type: DataTypes.FLOAT },

    // ---- Détails logement
    pieces:       { type: DataTypes.INTEGER },
    toilettes:    { type: DataTypes.INTEGER },
    sallesDeBain: { type: DataTypes.INTEGER },
    chauffage:    { type: DataTypes.STRING },
    eauChaude:    { type: DataTypes.STRING },
    amenities:    { type: DataTypes.JSON },

    // ---- ✅ Meublé / non meublé
    isFurnished: {
      type: DataTypes.BOOLEAN,
      allowNull: true, // null = non renseigné
      comment: 'true = meublé, false = non meublé, null = non renseigné',
    },
    furnished: {
      type: DataTypes.ENUM('meublé', 'non_meublé'),
      allowNull: true,
      comment: 'Valeur textuelle dérivée de isFurnished',
    },

    // Résultats calcul financier (si tu gardes)
    financial: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Résultats calcul financier (legacy)',
    },
  }, {
    tableName: 'properties',
    timestamps: true,
    hooks: {
      beforeValidate(instance) {
        const rk = String(instance.rentalKind || '').toUpperCase();
        if (rk === 'AV') instance.mode = 'achat_revente';
        else if (rk === 'LLD' || rk === 'LCD') instance.mode = 'location';

        if (instance.isFurnished === true)  instance.furnished = 'meublé';
        if (instance.isFurnished === false) instance.furnished = 'non_meublé';
        if (instance.isFurnished == null)   instance.furnished = null;
      },
    },
  });

  Property.associate = models => {
    // LLD / LCD
    Property.hasOne(models.FinancialInfoLLD, {
      foreignKey: 'propertyId',
      as: 'financialLld',
      onDelete: 'CASCADE',
    });
    Property.hasOne(models.FinancialInfoLCD, {
      foreignKey: 'propertyId',
      as: 'financialCld',
      onDelete: 'CASCADE',
    });

    // ✅ Ajout loyers
    Property.hasOne(models.RentConfig, {
      foreignKey: 'propertyId',
      as: 'rentConfig',
      onDelete: 'CASCADE',
    });
    Property.hasMany(models.RentPayment, {
      foreignKey: 'propertyId',
      as: 'rentPayments',
      onDelete: 'CASCADE',
    });
  };

  return Property;
};
