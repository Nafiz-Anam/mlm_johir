const payoutConfig = (sequelize, DataTypes) => {
  const payoutConfig = sequelize.define(
    "payoutConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      release_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      min_payout: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      request_validity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "in days",
      },
      max_payout: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mail_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: no 1 : yes",
      },
      fee_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fee_mode: {
        type: DataTypes.ENUM("flat", "percentage"),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          payoutConfig.tableName = `${options.prefix}payout_configurations`;
        },
        beforeFind: async function (options) {
          payoutConfig.tableName = `${options.prefix}payout_configurations`;
        },
      },
      // tableName: `${Prefix}payout_configurations`,
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
  // payoutConfig.sync({force:false})
  return payoutConfig;
};

export default payoutConfig;
