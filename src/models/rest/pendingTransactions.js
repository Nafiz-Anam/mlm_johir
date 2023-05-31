const pendingTransaction = (sequelize, DataTypes) => {
  const pendingTransaction = sequelize.define(
    "pendingTransaction",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      unapproved_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wallet_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      previous_timestamp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "0",
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "usdt",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pendingTransaction.tableName = `${options.prefix}pending_transactions`;
        },
        beforeFind: async function (options) {
          pendingTransaction.tableName = `${options.prefix}pending_transactions`;
        },
      },
      timestamps: true,
      underscored: true,
    }
  );
  pendingTransaction.associate = (models) => {};
  // ewalletHistory.sync({
  //     force: false
  // });
  return pendingTransaction;
};

export default pendingTransaction;
