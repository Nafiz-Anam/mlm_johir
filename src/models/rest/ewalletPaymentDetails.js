const ewalletPaymentDetails = (sequelize, DataTypes) => {
  const ewalletPaymentDetails = sequelize.define(
    "ewalletPaymentDetails",
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
        references: {
          model: "users",
          key: "id",
        },
      },
      used_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      used_for: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "transactions",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ewalletPaymentDetails.tableName = `${options.prefix}ewallet_payment_details`;
        },
        beforeFind: async function (options) {
          ewalletPaymentDetails.tableName = `${options.prefix}ewallet_payment_details`;
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
          name: "ewallet_payment_details_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "ewallet_payment_details_used_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "used_user",
            },
          ],
        },
        {
          name: "ewallet_payment_details_transaction_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "transaction_id",
            },
          ],
        },
      ],
    }
  );
  return ewalletPaymentDetails;
};

export default ewalletPaymentDetails;
