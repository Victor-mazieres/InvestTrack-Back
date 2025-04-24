module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Ce nom d'utilisateur est déjà utilisé."
      }
    },
    email: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    postalCode: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: "users",
    timestamps: true,
  });

  // Optionnel : association via une méthode d'associtation (si tu souhaites l'utiliser dans d'autres contextes)
  User.associate = (models) => {
    User.hasMany(models.Action, { foreignKey: "userId", onDelete: "CASCADE" });
    User.hasMany(models.Simulation, { foreignKey: "userId" });
    User.hasMany(models.MortgageSimulation, { foreignKey: "userId" });
    User.hasMany(models.Property, { foreignKey: "userId" });
    User.hasMany(models.Tenant, { foreignKey: "userId" });
  };

  return User;
};
