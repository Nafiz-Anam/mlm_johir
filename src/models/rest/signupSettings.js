const signupSettings = (sequelize, DataTypes) => {
  const signupSettings = sequelize.define(
    "signupSettings",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      registration_allowed: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
      },
      sponsor_required: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
      },
      mail_notification: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
      binary_leg: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "any",
      },
      age_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },
      bank_info_required: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
      },
      compression_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
      default_country: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 99,
      },
      email_verification: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
      login_unapproved: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          signupSettings.tableName = `${options.prefix}signup_settings`;
        },
        beforeFind: async function (options) {
          signupSettings.tableName = `${options.prefix}signup_settings`;
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
  // signupSettings.sync({force:false})
  return signupSettings;
};

export default signupSettings;
