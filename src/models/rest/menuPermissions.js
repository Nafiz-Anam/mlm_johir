const menuPermissions = (sequelize, DataTypes) => {
  const menuPermissions = sequelize.define(
    "menuPermissions",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      menu_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "menus",
          key: "id",
        },
      },
      admin_permission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      user_permission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          menuPermissions.tableName = `${options.prefix}menu_permissions`;
        },
        beforeFind: async function (options) {
          menuPermissions.tableName = `${options.prefix}menu_permissions`;
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
          name: "menu_permissions_menu_id_foreign",
          using: "BTREE",
          fields: [{ name: "menu_id" }],
        },
      ],
    }
  );
  menuPermissions.associate = (models) => {
    menuPermissions.belongsTo(models.menus, {
      foreignKey: "menu_id",
    });
  };
  // menuPermissions.sync({force:false})
  return menuPermissions;
};

export default menuPermissions;
