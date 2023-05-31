const partyProducts = (sequelize, DataTypes) => {
  const partyProducts = sequelize.define(
    "partyProducts",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      model: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      upc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ean: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      jan: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isbn: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mpn: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      stock_status_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      manufacturer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      shipping: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 false 1 true",
      },
      price: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tax_class_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      date_available: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      weight: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      weight_class_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      length: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      height: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      length_class_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      subtract: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0 false 1 true",
      },
      minimum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1 true 0 false",
      },
      viewed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      width: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          partyProducts.tableName = `${options.prefix}party_products`;
        },
        beforeFind: async function (options) {
          partyProducts.tableName = `${options.prefix}party_products`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "party_products_stock_status_id_foreign",
          using: "BTREE",
          fields: [{ name: "stock_status_id" }],
        },
        {
          name: "party_products_manufacturer_id_foreign",
          using: "BTREE",
          fields: [{ name: "manufacturer_id" }],
        },
        {
          name: "party_products_tax_class_id_foreign",
          using: "BTREE",
          fields: [{ name: "tax_class_id" }],
        },
        {
          name: "party_products_weight_class_id_foreign",
          using: "BTREE",
          fields: [{ name: "weight_class_id" }],
        },
        {
          name: "party_products_length_class_id_foreign",
          using: "BTREE",
          fields: [{ name: "length_class_id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return partyProducts;
};

export default partyProducts;
