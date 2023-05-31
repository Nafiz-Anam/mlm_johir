const purchaseWalletHistory = (sequelize, DataTypes) => {
  const purchaseWalletHistory = sequelize.define(
    "purchaseWalletHistory",
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
      },
      from_user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      ewallet_refid: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      purchase_wallet: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      amount_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: "2022-05-13",
      },
      tds: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          purchaseWalletHistory.tableName = `${options.prefix}purchase_wallet_histories`;
        },
        beforeFind: async function (options) {
          sequelize.models.user.tableName = `${options.prefix}users`;
          purchaseWalletHistory.tableName = `${options.prefix}purchase_wallet_histories`;
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
      ],
    }
  );

  purchaseWalletHistory.associate = (models) => {
    purchaseWalletHistory.belongsTo(models.user, {
      foreignKey: "from_user_id",
    });
  };
  // purchaseWalletHistory.sync({force:false})
  return purchaseWalletHistory;
};

export default purchaseWalletHistory;
