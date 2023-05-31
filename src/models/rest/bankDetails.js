const bankDetails = (sequelize, DataTypes) => {
  const bankDetails = sequelize.define(
    "bankDetails",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      account_info: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          bankDetails.tableName = `${options.prefix}bank_transfer_settings`;
        },
        beforeFind: async function (options) {
          bankDetails.tableName = `${options.prefix}bank_transfer_settings`;
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

  // address.sync({force:false})
  return bankDetails;
};

export default bankDetails;
