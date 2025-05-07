// src/models/PropertyPhoto.js
module.exports = (sequelize, DataTypes) => {
    const PropertyPhoto = sequelize.define('PropertyPhoto', {
      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'properties', key: 'id' },
        onDelete: 'CASCADE',
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      caption: {
        type: DataTypes.STRING,
      },
    }, {
      tableName: 'property_photos',
      timestamps: true,
    });
  
    PropertyPhoto.associate = models => {
      PropertyPhoto.belongsTo(models.Property, {
        foreignKey: 'propertyId',
        as: 'property',
      });
    };
  
    return PropertyPhoto;
  };
  