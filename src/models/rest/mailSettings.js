const mailSettings = (sequelize, DataTypes) => {
  const mailSettings = sequelize.define(
    "mailSettings",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      from_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      from_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_host: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_port: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_timeout: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reg_mailstatus: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0",
        comment: "0 for no 1 for yes",
      },
      reg_mailcontent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reg_mailtype: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      smtp_authentication: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "1",
        comment: "0 for disabled 1 for enabled",
      },
      smtp_protocol: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          mailSettings.tableName = `${options.prefix}mail_settings`;
        },
        beforeFind: async function (options) {
          mailSettings.tableName = `${options.prefix}mail_settings`;
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

  return mailSettings;
};

export default mailSettings;
