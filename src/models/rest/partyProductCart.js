const partyProductCart = (sequelize, DataTypes) => {
    const partyProductCart = sequelize.define(
      "partyProductCart",
      {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true
          },
          product_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          guest_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          party_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
          },
          ordered_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          total_amount: {
            type: DataTypes.DOUBLE(8,2),
            allowNull: false,
            defaultValue: 0.00
          },
          is_processed: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: "0 false 1 true"
          },
          is_approved: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: "0 false 1 true"
          },
          status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: "0 for false 1 true only false when order is approved"
          }
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async function (instance, options) {
            partyProductCart.tableName = `${options.prefix}party_product_to_carts`;
          },
          beforeFind: async function (options) {
            partyProductCart.tableName = `${options.prefix}party_product_to_carts`;
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
              name: "party_product_to_carts_product_id_foreign",
              using: "BTREE",
              fields: [
                { name: "product_id" },
              ]
            },
            {
              name: "party_product_to_carts_guest_id_foreign",
              using: "BTREE",
              fields: [
                { name: "guest_id" },
              ]
            },
            {
              name: "party_product_to_carts_party_id_foreign",
              using: "BTREE",
              fields: [
                { name: "party_id" },
              ]
            },
          ]
      }
    );
  
    // address.sync({force:false})
    return partyProductCart;
  };
  
  export default partyProductCart;
  