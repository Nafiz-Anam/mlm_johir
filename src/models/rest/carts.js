const carts = (sequelize, DataTypes) => {
  const carts = sequelize.define(
    "carts",
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
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "packages",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          carts.tableName = `${options.prefix}carts`;
        },
        beforeFind: async function (options) {
          carts.tableName = `${options.prefix}carts`;
          sequelize.models.pack.tableName = `${options.prefix}packages`;
        },
      },
      // tableName: `${Prefix}carts`,
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
          name: "carts_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "carts_package_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "package_id",
            },
          ],
        },
      ],
    }
  );
  carts.associate = (models) => {
    carts.belongsTo(models.pack, {
      foreignKey: "package_id",
    });
  };
  // carts.sync({force:false})
  return carts;
};

export default carts;
