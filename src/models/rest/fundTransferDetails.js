const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const fundTransferDetails = (sequelize, DataTypes) => {
  const fundTransferDetails = sequelize.define(
    "fundTransferDetails",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      from_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      to_id: {
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
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      amount_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      trans_fee: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      transaction_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "transactions",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          fundTransferDetails.tableName = `${options.prefix}fund_transfer_details`;
        },
        beforeFind: async function (options) {
          sequelize.models.user.tableName = `${options.prefix}users`;
          fundTransferDetails.tableName = `${options.prefix}fund_transfer_details`;
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
          name: "fund_transfer_details_from_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "from_id",
            },
          ],
        },
        {
          name: "fund_transfer_details_to_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "to_id",
            },
          ],
        },
        {
          name: "fund_transfer_details_transaction_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "transaction_id",
            },
          ],
        },
      ],
    }
  );
  fundTransferDetails.associate = (models) => {
    fundTransferDetails.belongsTo(models.user, {
      foreignKey: "from_id",
      sourceKey: "from_id",
      as: "fromUser",
    });
    fundTransferDetails.belongsTo(models.user, {
      foreignKey: "to_id",
      sourceKey: "to_id",
      as: "toUser",
    });
  };

  // fundTransferDetails.sync({
  //     force: false
  // })
  return fundTransferDetails;
};

export default fundTransferDetails;
