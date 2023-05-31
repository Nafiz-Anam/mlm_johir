const userWalletBalance = (sequelize, DataTypes) => {
  const userWalletBalance = sequelize.define(
    "userWalletBalance",
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
      balance: {
        type: DataTypes.DECIMAL(14, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      private_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userWalletBalance.tableName = `${options.prefix}user_wallet_balances`;
        },
        beforeFind: async function (options) {
          userWalletBalance.tableName = `${options.prefix}user_wallet_balances`;
          sequelize.models.user.tableName = `${options.prefix}users`;
        },
      },
      timestamps: true,
      underscored: true,
    }
  );
  userWalletBalance.associate = (models) => {
    userWalletBalance.belongsTo(models.user, {
      foreignKey: "user_id",
    });
  };
  // userWalletBalance.sync({
  //     force: false
  // });
  return userWalletBalance;
};

export default userWalletBalance;
