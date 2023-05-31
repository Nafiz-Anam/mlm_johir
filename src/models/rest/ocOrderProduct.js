const ocOrderProduct = (sequelize, DataTypes) => {
  const ocOrderProduct = sequelize.define(
    "ocOrderProduct",
    {
      order_product_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      master_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      reward: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          ocOrderProduct.tableName = `${options.prefix}oc_order_product`;
        },
        beforeFind: async function (options) {
          ocOrderProduct.tableName = `${options.prefix}oc_order_product`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: false,
      //   underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return ocOrderProduct;
};

export default ocOrderProduct;
