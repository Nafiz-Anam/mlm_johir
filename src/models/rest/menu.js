const menus = (sequelize, DataTypes) => {
  const menus = sequelize.define(
    "menus",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      admin_only: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      react_only: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "menus",
          key: "id",
        },
      },
      order: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      child_order: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      is_heading: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      has_children: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      react: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      is_child: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      side_menu: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      settings_menu: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      user_icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      admin_icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mobile_icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      route_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          menus.tableName = `${options.prefix}menus`;
        },
        beforeFind: async function (options) {
          menus.tableName = `${options.prefix}menus`;
          sequelize.models.menuPermissions.tableName = `${options.prefix}menu_permissions`;
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
          name: "menus_parent_id_foreign",
          using: "BTREE",
          fields: [{ name: "parent_id" }],
        },
      ],
    }
  );
  menus.associate = (models) => {
    menus.hasOne(models.menuPermissions, {
      foreignKey: "menu_id",
    });
    menus.hasMany(models.menus, {
      foreignKey: "parent_id",
      as: "submenu",
    });
  };
  // menus.sync({force:false})
  return menus;
};

export default menus;
