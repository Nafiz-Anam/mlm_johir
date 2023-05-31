const ocOrderTotal = (sequelize, DataTypes) => {
  const ocOrderTotal = sequelize.define(
    "ocOrderTotal",
    {
      order_total_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      extension: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ocOrderTotal.tableName = `${options.prefix}oc_order_total`;
        },
        beforeFind: async function (options) {
          ocOrderTotal.tableName = `${options.prefix}oc_order_total`;
        },
      },
      // tableName: `${Prefix}access_keys`,
      timestamps: false,
      //   underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "order_total_id" }],
        },
        {
          name: "order_id",
          using: "BTREE",
          fields: [{ name: "order_id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return ocOrderTotal;
};

export default ocOrderTotal;
