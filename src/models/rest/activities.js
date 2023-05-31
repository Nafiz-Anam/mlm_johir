const activities = (sequelize, DataTypes) => {
  const activities = sequelize.define(
    "activities",
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
        references: {
          model: "users",
          key: "id",
        },
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      activity: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          activities.tableName = `${options.prefix}activities`;
        },
        beforeFind: async function (options) {
          activities.tableName = `${options.prefix}activities`;
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
        {
          name: "activities_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );

  return activities
};

export default activities
