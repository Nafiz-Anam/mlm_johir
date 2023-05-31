const roiOrder = (sequelize, DataTypes) => {
  const roiOrder = sequelize.define(
    "roiOrder",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      date_submission: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      pending_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: pending 1 : active",
      },
      roi: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: true,
      },
      days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_amount: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: true,
      },
      commission_amount: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          roiOrder.tableName = `${options.prefix}roi_order`;
        },
        beforeFind: async function (options) {
          roiOrder.tableName = `${options.prefix}roi_order`;
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
          name: "roi_order_package_id_foreign",
          using: "BTREE",
          fields: [{ name: "package_id" }],
        },
        {
          name: "roi_order_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "roi_order_payment_method_foreign",
          using: "BTREE",
          fields: [{ name: "payment_method" }],
        },
      ],
    }
  );
  // roiOrder.sync({force:false})
  return roiOrder;
};

export default roiOrder;
