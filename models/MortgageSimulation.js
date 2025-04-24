// === models/MortgageSimulation.js ===
module.exports = (sequelize, DataTypes) => {
  const MortgageSimulation = sequelize.define('MortgageSimulation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    // Ajoutez d'autres champs ici si nécessaire
  }, {
    tableName: 'mortgage_simulations',
    timestamps: true,
  });

  return MortgageSimulation;
};
