const userDashboardItems = (sequelize, DataTypes) => {
  const userDashboardItems = sequelize.define(
    "userDashboardItems",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "user_dashboards_name_unique",
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "1",
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "user_dashboards",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userDashboardItems.tableName = `${options.prefix}user_dashboards`;
        },
        beforeFind: async function (options) {
          userDashboardItems.tableName = `${options.prefix}user_dashboards`;
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
        {
          name: "user_dashboards_name_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "name",
            },
          ],
        },
        {
          name: "user_dashboards_parent_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "parent_id",
            },
          ],
        },
      ],
    }
  );
  // userDashboardItems.sync({
  //     force: false
  // })
  return userDashboardItems;
};

export default userDashboardItems;
