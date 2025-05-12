// utils/queryOptimizer.js
/**
 * Utilitaires pour optimiser les requêtes Sequelize
 */

// Limiter les champs sélectionnés pour les requêtes de liste (évite de charger toutes les données)
const getSelectFields = (model, excludeFields = ['createdAt', 'updatedAt']) => {
    return Object.keys(model.rawAttributes)
      .filter(field => !excludeFields.includes(field));
  };
  
  // Optimisation pour les requêtes de liste avec pagination
  const getPaginationOptions = (page = 1, limit = 20, options = {}) => {
    const offset = (page - 1) * limit;
    return {
      limit: parseInt(limit),
      offset: parseInt(offset),
      ...options
    };
  };
  
  // Option pour optimiser une requête avec jointures
  const getJoinOptions = (include, attributes = null) => {
    const options = {
      include: include
    };
    
    if (attributes) {
      options.attributes = attributes;
    }
    
    return options;
  };
  
  // Pour les recherches textuelles optimisées (implémente la recherche en fonction du dialecte SQL)
  const getSearchOptions = (field, searchTerm, dialect = 'mysql') => {
    if (!searchTerm) return {};
    
    // Échappement des caractères spéciaux
    const sanitizedTerm = searchTerm
      .replace(/[%_\\]/g, char => `\\${char}`)
      .trim();
    
    // Différentes options selon le dialecte de la base de données
    switch (dialect.toLowerCase()) {
      case 'postgres':
        return {
          [field]: {
            [Sequelize.Op.iLike]: `%${sanitizedTerm}%`
          }
        };
      case 'mysql':
      default:
        return {
          [field]: {
            [Sequelize.Op.like]: `%${sanitizedTerm}%`
          }
        };
    }
  };
  
  // Création d'un index composite pour les requêtes fréquentes
  const createCompositeIndex = async (queryInterface, tableName, fields, indexName) => {
    try {
      await queryInterface.addIndex(
        tableName,
        fields,
        {
          name: indexName,
          unique: false // Modifier selon les besoins
        }
      );
      console.log(`Index ${indexName} créé avec succès sur ${tableName}`);
    } catch (error) {
      console.error(`Erreur lors de la création de l'index ${indexName}:`, error);
    }
  };
  
  // Fonction utilitaire pour joindre efficacement les modèles associés
  const getIncludeWithScope = (model, scope = null, attributes = null) => {
    const include = { model };
    
    if (scope) {
      include.scope = scope;
    }
    
    if (attributes) {
      include.attributes = attributes;
    }
    
    return include;
  };
  
  // Fonction pour optimiser une requête qui cherche par ID
  const findByIdOptimized = async (model, id, options = {}) => {
    try {
      return await model.findByPk(id, {
        ...options,
        // Utiliser un verrouillage léger pour les lectures
        lock: false,
        skipLocked: true
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche par ID dans ${model.name}:`, error);
      throw error;
    }
  };
  
  module.exports = {
    getSelectFields,
    getPaginationOptions,
    getJoinOptions,
    getSearchOptions,
    createCompositeIndex,
    getIncludeWithScope,
    findByIdOptimized
  };