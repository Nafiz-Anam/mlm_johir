const commonMailSettings = (sequelize, DataTypes) => {
  const commonMailSettings = sequelize.define(
    "commonMailSettings",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      mail_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mail_content: {
        type: DataTypes.TEXT,
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
          commonMailSettings.tableName = `${options.prefix}common_mail_settings`;
        },
        beforeFind: (options) => {
          commonMailSettings.tableName = `${options.prefix}common_mail_settings`;
        },
      },
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
  return commonMailSettings;
};

export default commonMailSettings;
