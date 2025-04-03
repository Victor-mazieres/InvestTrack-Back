// models/Property.js
module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.STRING,
      postalCode: DataTypes.STRING,
      city: DataTypes.STRING,
      surface: DataTypes.INTEGER,
      propertyType: DataTypes.STRING,
      building: DataTypes.STRING,
      lot: DataTypes.STRING,
      floor: DataTypes.STRING,
      door: DataTypes.STRING,
      owner: DataTypes.STRING,
      acquisitionDate: DataTypes.DATE,
      value: DataTypes.INTEGER,
      pieces: DataTypes.INTEGER,
      toilettes: DataTypes.INTEGER,
      sallesDeBain: DataTypes.INTEGER,
      chauffage: DataTypes.STRING,
      eauChaude: DataTypes.STRING,
      // Stockage des équipements sous forme de JSON
      amenities: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    }, {
      tableName: 'properties'
    });
  
    return Property;
  };
  