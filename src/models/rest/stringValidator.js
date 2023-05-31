const stringValidator = (sequelize, DataTypes) => {
  const stringValidator = sequelize.define(
    "stringValidator",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      string: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          stringValidator.tableName = `${options.prefix}string_validators`;
        },
        beforeFind: async function (options) {
          stringValidator.tableName = `${options.prefix}string_validators`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return stringValidator;
};

export default stringValidator;
