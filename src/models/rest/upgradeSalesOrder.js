const upgradeSalesOrder = (sequelize, DataTypes) => {
  const upgradeSalesOrder = sequelize.define(
    "upgradeSalesOrder",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      total_pv: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          upgradeSalesOrder.tableName = `${options.prefix}upgrade_sales_orders`;
        },
        beforeFind: async function (options) {
          upgradeSalesOrder.tableName = `${options.prefix}upgrade_sales_orders`;
        },
      },
      // tableName: `${Prefix}upgradeSalesOrder`,
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
          name: "upgrade_sales_orders_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "upgrade_sales_orders_package_id_foreign",
          using: "BTREE",
          fields: [{ name: "package_id" }],
        },
      ],
    }
  );
  // upgradeSalesOrder.sync({force:false})
  return upgradeSalesOrder;
};

export default upgradeSalesOrder;
