const ocProducts = (sequelize, DataTypes) => {
  const ocProducts = sequelize.define(
    "ocProducts",
    {
      product_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      master_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      package_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      validity: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      model: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      upc: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      ean: {
        type: DataTypes.STRING(14),
        allowNull: false,
      },
      jan: {
        type: DataTypes.STRING(13),
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING(17),
        allowNull: false,
      },
      mpn: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      variant: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      override: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      stock_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      manufacturer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tax_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_available: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      weight: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      weight_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      length: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      width: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      height: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      length_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      subtract: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
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
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      viewed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_modified: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      referral_commission: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pair_value: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ocProducts.tableName = `${options.prefix}oc_product`;
        },
        beforeFind: async function (options) {
          ocProducts.tableName = `${options.prefix}oc_product`;
        },
      },
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "product_id" }],
        },
      ],
    }
  );

  ocProducts.associate = (models) => {
    ocProducts.hasOne(models.user, {
      foreignKey: "product_id",
      as: "oc_package",
    });
  };
  // address.sync({force:false})
  return ocProducts;
};

export default ocProducts;
