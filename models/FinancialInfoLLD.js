// models/FinancialInfoLLD.js
module.exports = (sequelize, DataTypes) => {
  const FinancialInfoLLD = sequelize.define('FinancialInfoLLD', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // ✅ une seule ligne LLD par bien
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,                 // <— important
      field: 'property_id',
    },

    // Achat / Crédit (LLD)
    prixAgence:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    fraisAgence:      { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    netVendeur:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    decoteMeuble:     { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    fraisNotairePct:  { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: '8.00' },

    travaux:          { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    travauxEstimes:   { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'travaux_estimes' },
    travauxRestants:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'travaux_restants' },

    tauxPret:         { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: '0.00', field: 'taux_pret' },
    dureePretAnnees:  { type: DataTypes.INTEGER,       allowNull: false, defaultValue: 20,    field: 'duree_pret_annees' },
    apport:           { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    assurEmprunteur:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'assur_emprunteur' },

    // Charges & périodes
    taxeFonciere:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'taxe_fonciere' },
    taxeFoncierePeriod: { type: DataTypes.ENUM('monthly','annual'), allowNull: false, defaultValue: 'annual', field: 'taxe_fonciere_period' },
    chargesCopro:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'charges_copro' },
    chargesCoproPeriod: { type: DataTypes.ENUM('monthly','annual'), allowNull: false, defaultValue: 'annual', field: 'charges_copro_period' },
    assurancePno:       { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'assurance_pno' },
    assurancePnoPeriod: { type: DataTypes.ENUM('monthly','annual'), allowNull: false, defaultValue: 'annual', field: 'assurance_pno_period' },

    elecGaz:     { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'elec_gaz' },
    internet:    { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    entretien:   { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00' },
    autreSortie: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'autre_sortie' },
    chargeRecup: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'charge_recup' },

    // Flux locatifs
    loyerHc:     { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'loyer_hc' },
    chargesLoc:  { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: '0.00', field: 'charges_loc' },

    // Fiscalité
    tmi:        { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: '0.00' },
    cotSocPct:  { type: DataTypes.DECIMAL(5,2),  allowNull: false, defaultValue: '0.00', field: 'cot_soc_pct' },

    // Résultats / agrégats (si tu les stockes)
    emprunt:           { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00' },
    mensualite:        { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00' },
    totalSorties:      { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'total_sorties' },
    entreeHc:          { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'entree_hc' },
    totalCc:           { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'total_cc' },
    impotMensuel:      { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'impot_mensuel' },
    impotAnnuel:       { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'impot_annuel' },
    cfMensuel:         { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'cf_mensuel' },
    cfAnnuel:          { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'cf_annuel' },
    cfTotal:           { type: DataTypes.DECIMAL(16,2), allowNull: false, defaultValue: '0.00', field: 'cf_total' },
    cfNetNetMensuel:   { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00', field: 'cf_net_net_mensuel' },
    cfNetNetAnnuel:    { type: DataTypes.DECIMAL(16,2), allowNull: false, defaultValue: '0.00', field: 'cf_net_net_annuel' },
    cfNetNetTotal:     { type: DataTypes.DECIMAL(16,2), allowNull: false, defaultValue: '0.00', field: 'cf_net_net_total' },
    interets:          { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: '0.00' },
    roi:               { type: DataTypes.DECIMAL(6,2),  allowNull: false, defaultValue: '0.00' },
  }, {
    tableName: 'financial_infos_lld',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['property_id'] }, // renforce l’unicité au niveau SQL
    ],
  });

  FinancialInfoLLD.associate = (models) => {
    FinancialInfoLLD.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
  };

  return FinancialInfoLLD;
};
