module.exports = (sequelize, DataTypes) => {
  const Action = sequelize.define("Action", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    sector: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    quantity: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    purchasePrice: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true 
    },
    fees: { 
      type: DataTypes.DECIMAL(10, 2), 
      defaultValue: 0 
    },
    dividendPrice: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true 
    },
    dividendDate: { 
      type: DataTypes.DATEONLY, 
      allowNull: true 
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        try {
          return JSON.parse(this.getDataValue("history") || "[]");
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("history", JSON.stringify(value));
      },
    },
    priceHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        try {
          return JSON.parse(this.getDataValue("priceHistory") || "[]");
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("priceHistory", JSON.stringify(value));
      },
    },
    dividendsHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        try {
          return JSON.parse(this.getDataValue("dividendsHistory") || "[]");
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("dividendsHistory", JSON.stringify(value));
      },
    },
  }, {
    tableName: "actions",
    timestamps: true,
  });

  // Optionnel : méthode d'association
  Action.associate = (models) => {
    Action.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Action;
};
