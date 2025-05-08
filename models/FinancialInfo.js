// src/models/FinancialInfo.js
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
    prixAgence: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'prix_agence',
      get() { return parseFloat(this.getDataValue('prixAgence')); }
    },
    fraisAgence: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'frais_agence',
      get() { return parseFloat(this.getDataValue('fraisAgence')); }
    },
    netVendeur: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'net_vendeur',
      get() { return parseFloat(this.getDataValue('netVendeur')); }
    },
    decoteMeuble: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'decote_meuble',
      get() { return parseFloat(this.getDataValue('decoteMeuble')); }
    },
    fraisNotairePct: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      field: 'frais_notaire_pct',
      get() { return parseFloat(this.getDataValue('fraisNotairePct')); }
    },
    travaux: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      set(value) {
        this.setDataValue('travaux', value);
        this.setDataValue('travauxEstimes', value);
      },
      get() { return parseFloat(this.getDataValue('travaux')); }
    },
    travauxEstimes: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'travaux_estimes',
      defaultValue: 0,
      get() { return parseFloat(this.getDataValue('travauxEstimes')); }
    },
    travauxRestants: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'travaux_restants',
      defaultValue: 0,
      get() { return parseFloat(this.getDataValue('travauxRestants')); }
    },
    tauxPret: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      field: 'taux_pret',
      get() { return parseFloat(this.getDataValue('tauxPret')); }
    },
    dureePretAnnees: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      field: 'duree_pret_annees',
      get() { return parseFloat(this.getDataValue('dureePretAnnees')); }
    },
    taxeFonciere: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'taxe_fonciere',
      get() { return parseFloat(this.getDataValue('taxeFonciere')); }
    },
    taxeFoncierePeriod: {
      type: DataTypes.ENUM('monthly','annual'),
      allowNull: false,
      field: 'taxe_fonciere_period'
    },
    chargesCopro: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'charges_copro',
      get() { return parseFloat(this.getDataValue('chargesCopro')); }
    },
    chargesCoproPeriod: {
      type: DataTypes.ENUM('monthly','annual'),
      allowNull: false,
      field: 'charges_copro_period'
    },
    assurancePno: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'assurance_pno',
      get() { return parseFloat(this.getDataValue('assurancePno')); }
    },
    assurancePnoPeriod: {
      type: DataTypes.ENUM('monthly','annual'),
      allowNull: false,
      field: 'assurance_pno_period'
    },
    assurEmprunteur: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'assur_emprunteur',
      get() { return parseFloat(this.getDataValue('assurEmprunteur')); }
    },
    chargeRecup: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'charge_recup',
      get() { return parseFloat(this.getDataValue('chargeRecup')); }
    },
    elecGaz: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'elec_gaz',
      get() { return parseFloat(this.getDataValue('elecGaz')); }
    },
    autreSortie: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'autre_sortie',
      get() { return parseFloat(this.getDataValue('autreSortie')); }
    },
    loyerHc: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'loyer_hc',
      get() { return parseFloat(this.getDataValue('loyerHc')); }
    },
    chargesLoc: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      field: 'charges_loc',
      get() { return parseFloat(this.getDataValue('chargesLoc')); }
    },
    tmi: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      get() { return parseFloat(this.getDataValue('tmi')); }
    },
    cotSocPct: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      field: 'cot_soc_pct',
      get() { return parseFloat(this.getDataValue('cotSocPct')); }
    },
    emprunt: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      get() { return parseFloat(this.getDataValue('emprunt')); }
    },
    mensualite: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      get() { return parseFloat(this.getDataValue('mensualite')); }
    },
    totalSorties: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'total_sorties',
      get() { return parseFloat(this.getDataValue('totalSorties')); }
    },
    entreeHc: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'entree_hc',
      get() { return parseFloat(this.getDataValue('entreeHc')); }
    },
    totalCc: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'total_cc',
      get() { return parseFloat(this.getDataValue('totalCc')); }
    },
    impotMensuel: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'impot_mensuel',
      get() { return parseFloat(this.getDataValue('impotMensuel')); }
    },
    impotAnnuel: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'impot_annuel',
      get() { return parseFloat(this.getDataValue('impotAnnuel')); }
    },
    cfMensuel: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'cf_mensuel',
      get() { return parseFloat(this.getDataValue('cfMensuel')); }
    },
    cfAnnuel: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'cf_annuel',
      get() { return parseFloat(this.getDataValue('cfAnnuel')); }
    },
    cfTotal: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: false,
      field: 'cf_total',
      get() { return parseFloat(this.getDataValue('cfTotal')); }
    },
    cfNetNetMensuel: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'cf_net_net_mensuel',
      get() { return parseFloat(this.getDataValue('cfNetNetMensuel')); }
    },
    cfNetNetAnnuel: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: false,
      field: 'cf_net_net_annuel',
      get() { return parseFloat(this.getDataValue('cfNetNetAnnuel')); }
    },
    cfNetNetTotal: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: false,
      field: 'cf_net_net_total',
      get() { return parseFloat(this.getDataValue('cfNetNetTotal')); }
    },
    interets: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      get() { return parseFloat(this.getDataValue('interets')); }
    },
    roi: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: false,
      defaultValue: 0,
      get() { return parseFloat(this.getDataValue('roi')); }
    },
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
}