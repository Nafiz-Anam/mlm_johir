const orders = (sequelize, DataTypes) => {
  const orders = sequelize.define(
    "orders",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      invoice_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      order_address_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      total_pv: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      order_status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "1",
        comment: "0 for pending 1 for confirmed",
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
          orders.tableName = `${options.prefix}orders`;
        },
        beforeFind: async function (options) {
          orders.tableName = `${options.prefix}orders`;
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
            { name: "id" },
          ]
        },
        {
          name: "orders_user_id_foreign",
          using: "BTREE",
          fields: [
            { name: "user_id" },
          ]
        },
        {
          name: "orders_order_address_id_foreign",
          using: "BTREE",
          fields: [
            { name: "order_address_id" },
          ]
        },
      ]
    }
  );
  // orders.sync({force:false})
  return orders;
};

export default orders;
