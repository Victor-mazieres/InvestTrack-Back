// models/Action.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Action = sequelize.define(
  "Action",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    fees: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    dividendPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    dividendDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("history");
        try {
          return JSON.parse(rawValue);
        } catch (e) {
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
        const rawValue = this.getDataValue("priceHistory");
        try {
          return JSON.parse(rawValue);
        } catch (e) {
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
        const rawValue = this.getDataValue("dividendsHistory");
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      },
      set(value) {
        this.setDataValue("dividendsHistory", JSON.stringify(value));
      },
    },
  },
  {
    tableName: "actions",
    timestamps: true,
  }
);

Action.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Action, { foreignKey: "userId", as: "actions" });

module.exports = Action;
