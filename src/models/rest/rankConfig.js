const rankConfig = (sequelize, DataTypes) => {
  const rankConfig = sequelize.define(
    "rankConfig",
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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      calculation: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "instant",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: disabled, 1: enabled",
      },
      isProduct_dependent: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : No, 1 : Yes",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          rankConfig.tableName = `${options.prefix}rank_configurations`;
        },
        beforeFind: async function (options) {
          rankConfig.tableName = `${options.prefix}rank_configurations`;
        },
      },
      timestamps: false,
      // underscored: true,
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
  // rankConfig.sync({
  //     force: false
  // })
  return rankConfig;
};

export default rankConfig;
