
const accessToken = (sequelize, DataTypes) => {
  const accessToken = sequelize.define(
    "accessToken",
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
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "access_keys_token_unique",
      },
      mobile_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "access_keys_token_unique",
      },
      ip: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      expiry: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: "in days, 0 no limit",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          accessToken.tableName = `${options.prefix}access_keys`;
        },
        beforeFind: async function (options) {
          accessToken.tableName = `${options.prefix}access_keys`;
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
        {
          name: "access_keys_token_unique",
          unique: true,
          using: "BTREE",
          fields: [{ name: "token" }],
        },
        {
          name: "access_keys_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return accessToken;
};

export default accessToken;
