const pack = (sequelize, DataTypes) => {
  const pack = sequelize.define(
    "pack",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: disabled 1: enabled",
      },
      product_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "packages_product_id_unique",
      },
      price: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      bv_value: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: true,
        comment: "business volume",
      },
      pair_value: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      referral_commission: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: true,
      },
      pair_price: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      roi: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "subscription period in days",
      },
      validity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      joinee_commission: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: true,
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "repurchase_categories",
          key: "id",
        },
      },
      tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      package_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pack.tableName = `${options.prefix}packages`;
        },
        beforeFind: async function (options) {
          sequelize.models.repurchaseCategory.tableName = `${options.prefix}repurchase_categories`;
          pack.tableName = `${options.prefix}packages`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "id",
            },
          ],
        },
        {
          name: "packages_product_id_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "product_id",
            },
          ],
        },
        {
          name: "packages_category_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "category_id",
            },
          ],
        },
      ],
    }
  );
  pack.associate = (models) => {
    pack.hasOne(models.user, {
      foreignKey: "product_id",
      as: "package",
    });
    pack.belongsTo(models.repurchaseCategory, {
      foreignKey: "category_id",
    });
    pack.hasOne(models.carts, {
      foreignKey: "package_id",
    });
    pack.hasOne(models.orderDetails, {
      foreignKey: "package_id",
    });
  };

  // pack.sync({
  //     force: false
  // })
  return pack;
};

export default pack;
