// models/Work.js
module.exports = (sequelize, DataTypes) => {
  const Work = sequelize.define(
    "Work",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      // Clé vers l'appartement (Property)
      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Clé vers l'utilisateur propriétaire des données
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Tout le contenu "suivi des travaux" (pièces, todos, logs, photos...)
      // ⚠️ JSON nécessite MySQL 5.7+ / MariaDB 10.2+
      rooms: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "works",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["propertyId"] },
        // unique par (userId, propertyId) = 1 doc de travaux par couple utilisateur/appartement
        { unique: true, fields: ["userId", "propertyId"] },
      ],
    }
  );

  return Work;
};
