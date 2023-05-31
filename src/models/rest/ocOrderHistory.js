const ocOrderHistory = (sequelize, DataTypes) => {
  const ocOrderHistory = sequelize.define(
    "ocOrderHistory",
    {
      order_history_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notify: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ocOrderHistory.tableName = `${options.prefix}oc_order_history`;
        },
        beforeFind: async function (options) {
          ocOrderHistory.tableName = `${options.prefix}oc_order_history`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: false,
      // underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "order_history_id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return ocOrderHistory;
};

export default ocOrderHistory;
