const gadgetWalletHistory = (sequelize, DataTypes) => {
  const gadgetWalletHistory = sequelize.define(
    "bebWalletHistory",
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
        comment: "reffer to fun_transfer_details, leg_amount,amount_paids",
      },
      beb_wallet_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      amount: {
        type: DataTypes.STRING(255),
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
        defaultValue: "2022-04-11 09:56:16",
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
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "0",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          gadgetWalletHistory.tableName = `${options.prefix}beb_wallet_histories`;
        },
        beforeFind: async function (options) {
          gadgetWalletHistory.tableName = `${options.prefix}beb_wallet_histories`;
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
          name: "beb_wallet_histories_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "beb_wallet_histories_from_id_foreign",
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
  gadgetWalletHistory.associate = (models) => {
    gadgetWalletHistory.belongsTo(models.user, {
      foreignKey: "from_id",
      as: "bebWallet",
    });
    gadgetWalletHistory.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "bebUser",
    });
    // gadgetWalletHistory.belongsTo(models.pendingRegistration, {
    //   foreignKey: "reference_id",
    // });
  };
  // gadgetWalletHistory.sync({
  //   force: false,
  // });
  return gadgetWalletHistory;
};

export default gadgetWalletHistory;
