const ocOrders = (sequelize, DataTypes) => {
  const ocOrders = sequelize.define(
    "ocOrders",
    {
      order_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      invoice_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      invoice_prefix: {
        type: DataTypes.STRING(26),
        allowNull: false,
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      store_name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      store_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      customer_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      firstname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(96),
        allowNull: false,
      },
      telephone: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      custom_field: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_firstname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      payment_lastname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      payment_company: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      payment_address_1: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_address_2: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_city: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_postcode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      payment_country: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_zone: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_address_format: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_custom_field: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      payment_code: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_firstname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      shipping_lastname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      shipping_company: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      shipping_address_1: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_address_2: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_city: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_postcode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      shipping_country: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_zone: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_address_format: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shipping_custom_field: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shipping_method: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      shipping_code: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0.0,
      },
      order_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      affiliate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      commission: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
      },
      marketing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tracking: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language_code: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      currency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      currency_value: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: false,
        defaultValue: 1.0,
      },
      ip: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      forwarded_ip: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      accept_language: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date_added: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_modified: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ocOrders.tableName = `${options.prefix}oc_order`;
        },
        beforeFind: async function (options) {
          ocOrders.tableName = `${options.prefix}oc_order`;
          sequelize.models.ocOrderHistory.tableName = `${options.prefix}oc_order_history`;
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
          fields: [{ name: "order_id" }],
        },
      ],
    }
  );
  ocOrders.associate = (models) => {
    ocOrders.hasOne(models.ocOrderHistory, {
      foreignKey: "order_id",
    });
  };
  // address.sync({force:false})
  return ocOrders;
};

export default ocOrders;
