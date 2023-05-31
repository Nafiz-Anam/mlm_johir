const orderDetails = (sequelize, DataTypes) => {
  const orderDetails = sequelize.define(
    "orderDetails",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      product_pv: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      order_status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "1",
        comment: "0 for pending 1 for confirmed",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          orderDetails.tableName = `${options.prefix}order_details`;
        },
        beforeFind: async function (options) {
          orderDetails.tableName = `${options.prefix}order_details`;
          sequelize.models.pack.tableName = `${options.prefix}packages`;
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
          name: "order_details_order_id_foreign",
          using: "BTREE",
          fields: [{ name: "order_id" }],
        },
        {
          name: "order_details_package_id_foreign",
          using: "BTREE",
          fields: [{ name: "package_id" }],
        },
      ],
    }
  );
  orderDetails.associate = (models) => {
    orderDetails.belongsTo(models.pack, {
      foreignKey: "package_id",
    });
  };
  // orderDetails.sync({force:false})
  return orderDetails;
};

export default orderDetails;
