const stripePayment = (sequelize, DataTypes) => {
  const stripePayment = sequelize.define(
    "stripePayment",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      charge_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "from stripe charge api",
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      stripe_response: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          stripePayment.tableName = `${options.prefix}stripe_payment_details`;
        },
        beforeFind: async function (options) {
          stripePayment.tableName = `${options.prefix}stripe_payment_details`;
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
          name: "stripe_payment_details_user_id_foreign",
          using: "BTREE",
          fields: [
            { name: "user_id" },
          ]
        },
        // {
        //   name: "stripe_payment_details_product_id_foreign",
        //   using: "BTREE",
        //   fields: [
        //     { name: "product_id" },
        //   ]
        // },
        // {
        //   name: "stripe_payment_details_order_id_foreign",
        //   using: "BTREE",
        //   fields: [
        //     { name: "order_id" },
        //   ]
        // },
      ]
    }
  );

  return stripePayment;
};

export default stripePayment;
