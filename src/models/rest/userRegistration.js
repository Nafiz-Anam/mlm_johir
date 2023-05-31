const userRegistration = (sequelize, DataTypes) => {
  const userRegistration = sequelize.define(
    "userRegistration",
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
        unique: "users_registrations_user_id_foreign",
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "users_registrations_username_unique",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      second_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "countries",
          key: "id",
        },
      },
      country_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      state_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      state_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "packages",
          key: "id",
        },
      },
      product_pv: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      product_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      reg_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userRegistration.tableName = `${options.prefix}users_registrations`;
        },
        beforeFind: async function (options) {
          userRegistration.tableName = `${options.prefix}users_registrations`;
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
          name: "users_registrations_user_id_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "users_registrations_username_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "username",
            },
          ],
        },
        {
          name: "users_registrations_country_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "country_id",
            },
          ],
        },
        {
          name: "users_registrations_product_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "product_id",
            },
          ],
        },
      ],
    }
  );
  // userRegistration.sync({force:false})
  return userRegistration;
};

export default userRegistration;
