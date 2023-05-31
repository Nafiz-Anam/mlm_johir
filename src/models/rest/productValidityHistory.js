const productValidityHistory = (sequelize, DataTypes) => {
  const productValidityHistory = sequelize.define(
    "productValidityHistory",
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
      invoice_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      product_pv: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      payment_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pay_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      renewal_details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      renewal_status: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      receipt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
            productValidityHistory.tableName = `${options.prefix}package_validity_extend_histories`;
        },
        beforeFind: async function (options) {
          sequelize.models.user.tableName = `${options.prefix}users`;
          productValidityHistory.tableName = `${options.prefix}package_validity_extend_histories`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "package_validity_extend_histories_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "package_validity_extend_histories_package_id_foreign",
          using: "BTREE",
          fields: [{ name: "package_id" }],
        },
      ],
    }
  );

  return productValidityHistory
};

export default productValidityHistory
