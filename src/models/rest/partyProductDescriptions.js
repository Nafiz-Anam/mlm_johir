const partyProductDescription = (sequelize, DataTypes) => {
  const partyProductDescription = sequelize.define(
    "partyProductDescription",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "party_products",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tag: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keyword: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          partyProductDescription.tableName = `${options.prefix}party_product_descriptions`;
        },
        beforeFind: async function (options) {
          partyProductDescription.tableName = `${options.prefix}party_product_descriptions`;
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
          name: "party_product_descriptions_product_id_foreign",
          using: "BTREE",
          fields: [{ name: "product_id" }],
        },
      ],
    }
  );

  // address.sync({force:false})
  return partyProductDescription;
};

export default partyProductDescription;
