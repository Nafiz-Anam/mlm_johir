const cashWalletHistory = (sequelize, DataTypes) => {
  const cashWalletHistory = sequelize.define(
    "usdtWalletHistory",
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
      from_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: "reffer to fund_transfer_details, leg_amount,amount_paids",
      },
      usdt_wallet_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      balance: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      amount_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: "2022-09-14 08:31:21",
      },
      transaction_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transaction_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transaction_fee: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          cashWalletHistory.tableName = `${options.prefix}usdt_wallet_histories`;
        },
        beforeFind: async function (options) {
          cashWalletHistory.tableName = `${options.prefix}usdt_wallet_histories`;
          sequelize.models.user.tableName = `${options.prefix}users`;
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
          name: "usdt_wallet_histories_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "usdt_wallet_histories_from_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "from_id",
            },
          ],
        },
      ],
    }
  );
  cashWalletHistory.associate = (models) => {
    cashWalletHistory.belongsTo(models.user, {
      foreignKey: "from_id",
      as: "usdtWallet",
    });
    cashWalletHistory.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "usdtUser",
    });
    // cashWalletHistory.belongsTo(models.pendingRegistration, {
    //   foreignKey: "reference_id",
    // });
  };
  // cashWalletHistory.sync({
  //   force: true,
  // });
  return cashWalletHistory;
};

export default cashWalletHistory;
