// models/Tenant.js
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      // Vous pouvez utiliser DataTypes.DATE si vous souhaitez stocker une date,
      // sinon DataTypes.STRING pour conserver le format "JJ/MM/AAAA"
      type: DataTypes.STRING,
      allowNull: false,
    },
    occupation: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    profilePicture: {
      // Ce champ contiendra l'URL ou le nom du fichier de l'image
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'tenants',
    timestamps: true,
  });

  return Tenant;
};
