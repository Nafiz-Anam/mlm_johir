const ewalletHistory = (sequelize, DataTypes) => {
  const ewalletHistory = sequelize.define(
    "ewalletHistory",
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
      ewallet_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      purchase_wallet: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      balance: {
        type: DataTypes.DECIMAL(14, 4),
        allowNull: false,
        defaultValue: 0.0,
      },

      from_balance: {
        type: DataTypes.DECIMAL(14, 4),
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
        defaultValue: "2022-09-26 10:38:09",
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
          ewalletHistory.tableName = `${options.prefix}ewallet_histories`;
        },
        beforeFind: async function (options) {
          ewalletHistory.tableName = `${options.prefix}ewallet_histories`;
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
          fields: [{ name: "id" }],
        },
        {
          name: "14963_ewallet_histories_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "14963_ewallet_histories_from_id_foreign",
          using: "BTREE",
          fields: [{ name: "from_id" }],
        },
        {
          name: "14963_ewallet_histories_amount_type_index",
          using: "BTREE",
          fields: [{ name: "amount_type" }],
        },
        {
          name: "refernece",
          using: "BTREE",
          fields: [{ name: "reference_id" }],
        },
      ],
    }
  );
  ewalletHistory.associate = (models) => {
    ewalletHistory.belongsTo(models.user, {
      foreignKey: "from_id",
      as: "userWallet",
    });
    ewalletHistory.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "fundUser",
    });
    ewalletHistory.belongsTo(models.pendingRegistration, {
      foreignKey: "pending_id",
    });
  };
  // ewalletHistory.sync({
  //     force: false
  // });
  return ewalletHistory;
};

export default ewalletHistory;
