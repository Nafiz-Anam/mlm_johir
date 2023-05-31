const languages = (sequelize, DataTypes) => {
  const languages = sequelize.define(
    "languages",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name_in_english: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          languages.tableName = `${options.prefix}languages`;
        },
        beforeFind: async function (options) {
          languages.tableName = `${options.prefix}languages`;
        },
      },
      // tableName: `${Prefix}languages`,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "lang_id",
            },
          ],
        },
      ],
    }
  );
  // languages.sync({
  //     force: false
  // })
  return languages;
};

export default languages;
