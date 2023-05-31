const paymentReceipts = (sequelize, DataTypes) => {
    
    const paymentReceipts = sequelize.define(
      "paymentReceipts",
      {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        pending_registrations_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
        },
        receipt: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: "payment_receipts_username_unique",
        },
        user_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
        },
        type: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async function (instance, options) {
            paymentReceipts.tableName = `${options.prefix}payment_receipts`;
          },
          beforeFind: (options) => {
            paymentReceipts.tableName = `${options.prefix}payment_receipts`;
          },
        },
        // tableName: `${Prefix}payment_receipts`,
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
          // {
          //   name: "payment_receipts_username_unique",
          //   unique: true,
          //   using: "BTREE",
          //   fields: [
          //     { name: "username" },
          //   ]
          // },
          {
            name: "payment_receipts_pending_registrations_id_foreign",
            using: "BTREE",
            fields: [
              { name: "pending_registrations_id" },
            ]
          },
          {
            name: "payment_receipts_user_id_foreign",
            using: "BTREE",
            fields: [
              { name: "user_id" },
            ]
          },
        ]
      }
    );
    // paymentReceipts.sync({force:false})
    return paymentReceipts;
  };
  
  export default paymentReceipts;
  
 
  