const pendingSignupConfig = (sequelize, DataTypes) => {
  const pendingSignupConfig = sequelize.define(
    "pendingSignupConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pendingSignupConfig.tableName = `${options.prefix}pending_signup_configs`;
        },
        beforeFind: async function (options) {
          pendingSignupConfig.tableName = `${options.prefix}pending_signup_configs`;
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
  // pendingSignupConfig.sync({force:false})
  return pendingSignupConfig;
};

export default pendingSignupConfig;
