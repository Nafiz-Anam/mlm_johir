const packageUpgradeHistory = (sequelize, DataTypes) => {
  const packageUpgradeHistory = sequelize.define(
    "packageUpgradeHistory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      current_package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      new_package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      pv_difference: {
        type: DataTypes.DOUBLE(8,2),
        allowNull: false
      },
      payment_amount: {
        type: DataTypes.DOUBLE(8,2),
        allowNull: false
      },
      payment_type: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      done_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for inactive 1 for active"
      },
      payment_receipt: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      oc_current_package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      oc_new_package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      }
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          packageUpgradeHistory.tableName = `${options.prefix}package_upgrade_histories`;
        },
        beforeFind: async function (options) {
          packageUpgradeHistory.tableName = `${options.prefix}package_upgrade_histories`;
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
            { name: "id" },
          ]
        },
        {
          name: "package_upgrade_histories_user_id_foreign",
          using: "BTREE",
          fields: [
            { name: "user_id" },
          ]
        },
        {
          name: "package_upgrade_histories_current_package_id_foreign",
          using: "BTREE",
          fields: [
            { name: "current_package_id" },
          ]
        },
        {
          name: "package_upgrade_histories_new_package_id_foreign",
          using: "BTREE",
          fields: [
            { name: "new_package_id" },
          ]
        },
        {
          name: "package_upgrade_histories_done_by_foreign",
          using: "BTREE",
          fields: [
            { name: "done_by" },
          ]
        },
      ]
    }
  );
  // packageUpgradeHistory.sync({force:false})
  return packageUpgradeHistory;
};

export default packageUpgradeHistory;
