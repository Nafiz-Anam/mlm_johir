const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const passwordPolicy = (sequelize, DataTypes) => {
  const passwordPolicy = sequelize.define(
    "passwordPolicy",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      enable_policy: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      mixed_case: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "mixedcase status",
      },
      number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "number status",
      },
      sp_char: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "sp,character status",
      },
      min_length: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          passwordPolicy.tableName = `${options.prefix}password_policies`;
        },
        beforeFind: async function (options) {
          passwordPolicy.tableName = `${options.prefix}password_policies`;
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
  // passwordPolicy.sync({
  //     force: false
  // })
  return passwordPolicy;
};

export default passwordPolicy;
