const ocCart = (sequelize, DataTypes) => {
  const ocCart = sequelize.define(
    "ocCart",
    {
      cart_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      api_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_id: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subscription_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ocCart.tableName = `${options.prefix}oc_cart`;
        },
        beforeFind: async function (options) {
          ocCart.tableName = `${options.prefix}oc_cart`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "cart_id" }],
        },
        {
          name: "cart_id",
          using: "BTREE",
          fields: [
            { name: "api_id" },
            { name: "customer_id" },
            { name: "session_id" },
            { name: "product_id" },
            { name: "subscription_plan_id" },
          ],
        },
      ],
    }
  );

  // address.sync({force:false})
  return ocCart;
};

export default ocCart;
