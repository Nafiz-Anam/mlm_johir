const walletHistories = (sequelize, DataTypes) => {
  const walletHistories = sequelize.define(
    "walletHistories",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      from_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      unapproved_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(14, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      balance: {
        type: DataTypes.DECIMAL(14, 8),
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
        defaultValue: "2022-12-16 09:06:20",
      },
      transaction_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wallet_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      block_timestamp: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transaction_fee: {
        type: DataTypes.DECIMAL(14, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          walletHistories.tableName = `${options.prefix}wallet_histories`;
        },
        beforeFind: async function (options) {
          walletHistories.tableName = `${options.prefix}wallet_histories`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  walletHistories.associate = (models) => {
    walletHistories.belongsTo(models.user, {
      foreignKey: "from_id",
      as: "userCoinWallet",
    });
    walletHistories.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "fundCoinUser",
    });
  };
  // address.sync({force:false})
  return walletHistories;
};

export default walletHistories;
