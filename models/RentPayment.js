// src/models/RentPayment.js
module.exports = (sequelize, DataTypes) => {
  const RentPayment = sequelize.define('RentPayment', {
    userId:     { type: DataTypes.INTEGER, allowNull: false },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    date:       { type: DataTypes.DATEONLY, allowNull: false }, // date du paiement
    amount:     { type: DataTypes.FLOAT, allowNull: false },
    method:     { type: DataTypes.STRING, allowNull: false },   // virement/cb/cheque/especes/autre
    note:       { type: DataTypes.STRING },
  }, {
    tableName: 'rent_payments',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['propertyId'] },
      { fields: ['date'] },
    ],
  });

  RentPayment.associate = (models) => {
    RentPayment.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    RentPayment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return RentPayment;
};
