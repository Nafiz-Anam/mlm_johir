const paymentConfig = (sequelize, DataTypes) => {
  const paymentConfig = sequelize.define(
    "paymentConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mode: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "test",
      },
      payout_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      payout_sort_order: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      registration: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      repurchase: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      membership_renewal: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      admin_only: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      gate_way: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      payment_only: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      upgradation: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
      reg_pending_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for disable 1 for enable",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          paymentConfig.tableName = `${options.prefix}payment_gateway_configs`;
        },
        beforeFind: async function (options) {
          paymentConfig.tableName = `${options.prefix}payment_gateway_configs`;
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
          name: "payment_gateway_configs_slug_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "slug",
            },
          ],
        },
      ],
    }
  );
  // paymentConfig.sync({
  //     force: false
  // })
  return paymentConfig;
};

export default paymentConfig;
