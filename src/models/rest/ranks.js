const ranks = (sequelize, DataTypes) => {
  const ranks = sequelize.define(
    "ranks",
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
      },
      color: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      commission: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "packages",
          key: "id",
        },
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0 : Inactive, 1: Active",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ranks.tableName = `${options.prefix}ranks`;
        },
        beforeFind: async function (options) {
          ranks.tableName = `${options.prefix}ranks`;
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
          name: "ranks_package_id_foreign",
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
  // ranks.sync({force:false})
  return ranks;
};

export default ranks;
