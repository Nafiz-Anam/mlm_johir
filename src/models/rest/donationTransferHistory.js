const donationTransferHistory = (sequelize, DataTypes) => {
  const donationTransferHistory = sequelize.define(
    "donationTransferHistory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      from_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      to_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      payment_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "donation_transfer_details_transaction_id_unique",
      },
      level: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      exact_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          donationTransferHistory.tableName = `${options.prefix}donation_transfer_details`;
        },
        beforeFind: async function (options) {
          donationTransferHistory.tableName = `${options.prefix}donation_transfer_details`;
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
          name: "donation_transfer_details_transaction_id_unique",
          unique: true,
          using: "BTREE",
          fields: [{ name: "transaction_id" }],
        },
        {
          name: "donation_transfer_details_from_user_foreign",
          using: "BTREE",
          fields: [{ name: "from_user" }],
        },
        {
          name: "donation_transfer_details_to_user_foreign",
          using: "BTREE",
          fields: [{ name: "to_user" }],
        },
        {
          name: "donation_transfer_details_level_foreign",
          using: "BTREE",
          fields: [{ name: "level" }],
        },
        {
          name: "donation_transfer_details_exact_user_foreign",
          using: "BTREE",
          fields: [{ name: "exact_user" }],
        },
      ],
    }
  );

  // donationTransferHistory.sync({force:false})
  return donationTransferHistory;
};

export default donationTransferHistory;
