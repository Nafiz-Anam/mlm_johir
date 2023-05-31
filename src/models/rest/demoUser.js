const demoUsers = (sequelize, DataTypes) => {
  const demoUsers = sequelize.define(
    "demoUsers",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      prefix: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      mlm_plan: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      api_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "demo_users_username_unique",
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_preset: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: no, 1: yes",
      },
      account_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subscription_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
        comment: "no and yes",
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      default_lang: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "en",
      },
    },
    {
      sequelize,
      tableName: "demo_users",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "demo_users_username_unique",
          unique: true,
          using: "BTREE",
          fields: [{ name: "username" }],
        },
      ],
    }
  );
//   demoUsers.sync({ force: false });
  return demoUsers;
};

export default demoUsers;