const userBalance = (sequelize, DataTypes) => {
  const userBalance = sequelize.define(
    "userBalance",
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
        references: {
          model: "users",
          key: "id",
        },
      },
      balance_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      purchase_wallet: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      // usdt_wallet: {
      //   type: DataTypes.DOUBLE(8, 2),
      //   allowNull: true,
      // },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userBalance.tableName = `${options.prefix}user_balance_amounts`;
        },
        beforeFind: async function (options) {
          userBalance.tableName = `${options.prefix}user_balance_amounts`;
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
          name: "user_balance_amounts_user_id_foreign",
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
  // userBalance.sync({
  //     force: false
  // });
  userBalance.associate = (models) => {
    userBalance.belongsTo(models.user, {
      foreignKey: "user_id",
    });
  };
  return userBalance;
};

export default userBalance;
