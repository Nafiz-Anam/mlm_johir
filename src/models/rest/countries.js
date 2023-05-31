const countries = (sequelize, DataTypes) => {
  const countries = sequelize.define(
    "countries",
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
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      iso_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0 for disable 1 for enable",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          countries.tableName = `${options.prefix}countries`;
        },
        beforeFind: async function (options) {
          countries.tableName = `${options.prefix}countries`;
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
      ],
    }
  );
  countries.associate = (models) => {
    countries.hasMany(models.states, {
      foreignKey: "country_id",
    });
  };
  // countries.sync({
  //     force: false
  // });
  return countries;
};

export default countries;
