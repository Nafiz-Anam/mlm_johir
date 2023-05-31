const pendingRegistration = (sequelize, DataTypes) => {
  const pendingRegistration = sequelize.define(
    "pendingRegistration",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      updated_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
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
      sponsor_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "pending",
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_modified: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verification_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      default_currency: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_tokens: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pendingRegistration.tableName = `${options.prefix}pending_registrations`;
        },
        beforeFind: async function (options) {
          pendingRegistration.tableName = `${options.prefix}pending_registrations`;
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
          name: "pending_registrations_updated_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "updated_id",
            },
          ],
        },
        {
          name: "pending_registrations_sponsor_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "sponsor_id",
            },
          ],
        },
        {
          name: "pending_registrations_package_id_foreign",
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
  pendingRegistration.associate = (models) => {
    pendingRegistration.hasMany(models.ewalletHistory, {
      foreignKey: "pending_id",
    });
  };
  // pendingRegistration.sync({
  //     force: false
  // });
  return pendingRegistration;
};

export default pendingRegistration;
