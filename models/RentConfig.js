// src/models/RentConfig.js
module.exports = (sequelize, DataTypes) => {
  const RentConfig = sequelize.define('RentConfig', {
    userId:     { type: DataTypes.INTEGER, allowNull: false },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    startDate:  { type: DataTypes.DATEONLY, allowNull: false }, // 1ère date d’ancrage
    dueDay:     { type: DataTypes.INTEGER, allowNull: false },  // 1..31 (jour d’échéance)
  }, {
    tableName: 'rent_configs',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'propertyId'] },
      { fields: ['userId'] },
      { fields: ['propertyId'] },
    ],
  });

  RentConfig.associate = (models) => {
    RentConfig.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    RentConfig.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return RentConfig;
};
