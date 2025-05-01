// models/FinancialInfo.js
module.exports = (sequelize, DataTypes) => {
  const FinancialInfo = sequelize.define('FinancialInfo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'property_id',
    },
    prixAgence:      { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'prix_agence' },
    fraisAgence:     { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'frais_agence' },
    netVendeur:      { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'net_vendeur' },
    decoteMeuble:    { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'decote_meuble' },
    fraisNotairePct: { type: DataTypes.DECIMAL(5,2),  allowNull: false, field: 'frais_notaire_pct' },
    travaux:         { type: DataTypes.DECIMAL(10,2), allowNull: false },
    // ---- nouveaux champs ----
    travauxEstimes:  { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'travaux_estimes', defaultValue: 0 },
    travauxRestants: { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'travaux_restants', defaultValue: 0 },
    // -------------------------
    tauxPret:        { type: DataTypes.DECIMAL(5,2),  allowNull: false, field: 'taux_pret' },
    dureePretAnnees: { type: DataTypes.DECIMAL(5,2),  allowNull: false, field: 'duree_pret_annees' },

    taxeFonciere:        { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'taxe_fonciere' },
    taxeFoncierePeriod:  { type: DataTypes.ENUM('monthly','annual'), allowNull: false, field: 'taxe_fonciere_period' },
    chargesCopro:        { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'charges_copro' },
    chargesCoproPeriod:  { type: DataTypes.ENUM('monthly','annual'), allowNull: false, field: 'charges_copro_period' },
    assurancePno:        { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'assurance_pno' },
    assurancePnoPeriod:  { type: DataTypes.ENUM('monthly','annual'), allowNull: false, field: 'assurance_pno_period' },
    assurEmprunteur:     { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'assur_emprunteur' },
    chargeRecup:         { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'charge_recup' },
    elecGaz:             { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'elec_gaz' },
    autreSortie:         { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'autre_sortie' },

    loyerHc:     { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'loyer_hc' },
    chargesLoc:  { type: DataTypes.DECIMAL(10,2), allowNull: false, field: 'charges_loc' },

    tmi:         { type: DataTypes.DECIMAL(5,2),  allowNull: false },
    cotSocPct:   { type: DataTypes.DECIMAL(5,2),  allowNull: false, field: 'cot_soc_pct' },

    emprunt:           { type: DataTypes.DECIMAL(12,2), allowNull: false },
    mensualite:        { type: DataTypes.DECIMAL(12,2), allowNull: false },
    totalSorties:      { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'total_sorties' },
    entreeHc:          { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'entree_hc' },
    totalCc:           { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'total_cc' },
    impotMensuel:      { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'impot_mensuel' },
    impotAnnuel:       { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'impot_annuel' },
    cfMensuel:         { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'cf_mensuel' },
    cfAnnuel:          { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'cf_annuel' },
    cfTotal:           { type: DataTypes.DECIMAL(14,2), allowNull: false, field: 'cf_total' },
    cfNetNetMensuel:   { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'cf_net_net_mensuel' },
    cfNetNetAnnuel:    { type: DataTypes.DECIMAL(14,2), allowNull: false, field: 'cf_net_net_annuel' },
    cfNetNetTotal:     { type: DataTypes.DECIMAL(14,2), allowNull: false, field: 'cf_net_net_total' },
    interets:          { type: DataTypes.DECIMAL(12,2), allowNull: false },
    roi:               { type: DataTypes.DECIMAL(6,2),  allowNull: false },
  }, {
    tableName: 'financial_infos',
    timestamps: true,
    createdAt:  'created_at',
    updatedAt:  'updated_at',
  });

  FinancialInfo.associate = models => {
    FinancialInfo.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property'
    });
  };

  return FinancialInfo;
};
