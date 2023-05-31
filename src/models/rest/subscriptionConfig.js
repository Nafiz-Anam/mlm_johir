const subscriptionConfig = (sequelize, DataTypes) => {
  const subscriptionConfig = sequelize.define(
    "subscriptionConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      based_on: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reg_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for false 1 for true",
      },
      commission_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for false 1 for true",
      },
      payout_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for false 1 for true",
      },
      fixed_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for false 1 for true",
      },
      subscription_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0 for false 1 for true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          subscriptionConfig.tableName = `${options.prefix}subscription_configs`;
        },
        beforeFind: async function (options) {
          subscriptionConfig.tableName = `${options.prefix}subscription_configs`;
        },
      },
      // tableName: `${Prefix}subscriptionConfig`,
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
  // subscriptionConfig.sync({force:false})
  return subscriptionConfig;
};

export default subscriptionConfig;
