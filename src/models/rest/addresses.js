const address = (sequelize, DataTypes) => {
  const address = sequelize.define(
    "address",
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      zip: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_default: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0",
        comment: "0 for false 1 for true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          address.tableName = `${options.prefix}addresses`;
        },
        beforeFind: async function (options) {
          address.tableName = `${options.prefix}addresses`;
        },
      },
      // tableName: `${Prefix}addresses`,
      paranoid: true,
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
          name: "addresses_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
      ],
    }
  );

  // address.sync({force:false})
  return address;
};

export default address;
