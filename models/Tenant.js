// models/Tenant.js
module.exports = (sequelize, DataTypes) => {
    const Tenant = sequelize.define('Tenant', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        }
      },
      phone: DataTypes.STRING,
      address: DataTypes.STRING
    }, {
      tableName: 'tenants',
      timestamps: true,
    });
  
    return Tenant;
  };
  