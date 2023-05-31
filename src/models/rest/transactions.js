const transactions = (sequelize, DataTypes) => {
  const transactions = sequelize.define(
    "transactions",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          transactions.tableName = `${options.prefix}transactions`;
        },
        beforeFind: async function (options) {
          transactions.tableName = `${options.prefix}transactions`;
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
          fields: [
            { name: "id" },
          ]
        },
      ]
    }
  );

  // address.sync({force:false})
  return transactions;
};

export default transactions;
