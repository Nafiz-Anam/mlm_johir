const usernameConfig = (sequelize, DataTypes) => {
  const usernameConfig = sequelize.define(
    "usernameConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      length: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "17",
      },
      prefix_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
      },
      prefix: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "INFINITE",
      },
      user_name_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "dynamic",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          usernameConfig.tableName = `${options.prefix}username_configs`;
        },
        beforeFind: async function (options) {
          usernameConfig.tableName = `${options.prefix}username_configs`;
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
  // usernameConfig.sync({force:false})
  return usernameConfig;
};

export default usernameConfig;
