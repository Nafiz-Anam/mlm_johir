const walletPayoutHistory = (sequelize, DataTypes) => {
  const walletPayoutHistory = sequelize.define(
    "walletPayoutHistory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      ref_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE(14, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      request_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      response: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          walletPayoutHistory.tableName = `${options.prefix}wallet_payout_history`;
        },
        beforeFind: async function (options) {
          walletPayoutHistory.tableName = `${options.prefix}wallet_payout_history`;
        },
      },
      timestamps: false,
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
          name: "payout_release_requests_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
      ],
    }
  );
  walletPayoutHistory.associate = (models) => {};
  // walletPayoutHistory.sync({
  //     force: false
  // })
  return walletPayoutHistory;
};

export default walletPayoutHistory;
