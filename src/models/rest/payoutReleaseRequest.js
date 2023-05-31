const payoutReleaseRequest = (sequelize, DataTypes) => {
  const payoutReleaseRequest = sequelize.define(
    "payoutReleaseRequest",
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
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      balance_amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : pending, 1 : released, 2 : cancelled",
      },
      read_status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0",
        comment: "0 for no 1 for yes",
      },
      payout_fee: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: "fee amount,after calculations",
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          payoutReleaseRequest.tableName = `${options.prefix}payout_release_requests`;
        },
        beforeFind: async function (options) {
          sequelize.models.user.tableName = `${options.prefix}users`;
          payoutReleaseRequest.tableName = `${options.prefix}payout_release_requests`;
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
          name: "payout_release_requests_user_id_foreign",
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
  payoutReleaseRequest.associate = (models) => {
    payoutReleaseRequest.belongsTo(models.user, {
      foreignKey: "user_id",
    });
  };
  // payoutReleaseRequest.sync({
  //     force: false
  // })
  return payoutReleaseRequest;
};

export default payoutReleaseRequest;
