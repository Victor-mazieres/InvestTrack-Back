// === models/Simulation.js ===
module.exports = (sequelize, DataTypes) => {
  const Simulation = sequelize.define('Simulation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,

    // Champs existants
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

    // Champs pour stocker les résultats de calcul (mensualités, rentabilité, etc.)
    results: DataTypes.JSON,

    // Nouveaux champs
    renovationCosts: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    renovationPaidByPocket: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    syndicPeriod: {
      type: DataTypes.STRING,
      defaultValue: 'monthly',
      allowNull: false,
    },
    ownerInsurancePeriod: {
      type: DataTypes.STRING,
      defaultValue: 'annual',
      allowNull: false,
    },
    
    // Champs ajoutés pour le nouveau front
    propertyPriceNet: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Prix net vendeur calculé (sans frais d'agence)",
    },
    agencyFeesPercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Pourcentage des frais d'agence",
    },

    // (Optionnel) clé étrangère userId si vous liez un utilisateur à Simulation
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'simulations',
    timestamps: true,
  });

  return Simulation;
};