// models/FinancialInfoLCD.js
module.exports = (sequelize, DataTypes) => {
  const FinancialInfoLCD = sequelize.define('FinancialInfoLCD', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false, field: 'property_id' },

    // Commun investissement / crédit (min)
    prixAgence:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    fraisAgence:      { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    netVendeur:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    decoteMeuble:     { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    fraisNotairePct:  { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: 8.00 },

    travaux:          { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    travauxEstimes:   { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0, field: 'travaux_estimes' },
    travauxRestants:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0, field: 'travaux_restants' },

    tauxPret:         { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: 0, field: 'taux_pret' },
    dureePretAnnees:  { type: DataTypes.INTEGER,       allowNull: false, defaultValue: 20, field: 'duree_pret_annees' },
    apport:           { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    assurEmprunteur:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0, field: 'assur_emprunteur' },

    // Fixes (annuels ou mensuels * 12) — pas de Period ici, on reste simplifié
    taxeFonciere: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    chargesCopro: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    assurancePno: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    elecGaz:      { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    internet:     { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    entretien:    { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
    autreSortie:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },

    // Bloc LCD natif (JSON + colonnes dénormalisées)
    lcd: { type: DataTypes.JSON, allowNull: true, field: 'lcd_json' },

    nightlyPrice:                { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'nightly_price' }, // 2p
    targetNightsPerYear:         { type: DataTypes.INTEGER,       allowNull: true, field: 'target_nights_per_year' },
    avgStayLength:               { type: DataTypes.INTEGER,       allowNull: true, field: 'avg_stay_length' },
    taxeSejourPerNightPerPerson: { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'taxe_sejour_per_night_per_person' },
    avgGuests:                   { type: DataTypes.INTEGER,       allowNull: true, field: 'avg_guests' },

    platformFeePct:        { type: DataTypes.DECIMAL(5,2),  allowNull: true, field: 'platform_fee_pct' },
    managementPct:         { type: DataTypes.DECIMAL(5,2),  allowNull: true, field: 'management_pct' },
    channelManagerMonthly: { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'channel_manager_monthly' },

    cleaningCostPerStay: { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'cleaning_cost_per_stay' },
    laundryCostPerStay:  { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'laundry_cost_per_stay' },
    suppliesPerStay:     { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'supplies_per_stay' },
    otherVarPerStay:     { type: DataTypes.DECIMAL(10,2), allowNull: true, field: 'other_var_per_stay' },

    availabilityRate: { type: DataTypes.DECIMAL(5,2), allowNull: true, field: 'availability_rate' },
    avgOccupancyRate: { type: DataTypes.DECIMAL(5,2), allowNull: true, field: 'avg_occupancy_rate' },
  }, {
    tableName: 'financial_infos_lcd',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  FinancialInfoLCD.associate = models => {
    FinancialInfoLCD.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
  };

  return FinancialInfoLCD;
};
