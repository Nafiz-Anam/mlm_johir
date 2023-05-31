const currencies = (sequelize, DataTypes) => {
  const currencies = sequelize.define(
    "currencies",
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
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      value: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      symbol_left: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      symbol_right: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      default: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      delete_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "yes",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          currencies.tableName = `${options.prefix}currency_details`;
        },
        beforeFind: async function (options) {
          currencies.tableName = `${options.prefix}currency_details`;
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
  // currencies.sync({
  //     force: false
  // })
  return currencies;
};

export default currencies;
