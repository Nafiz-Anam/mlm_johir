const repurchaseCategory = (sequelize, DataTypes) => {
  const repurchaseCategory = sequelize.define(
    "repurchaseCategory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no-image",
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1 for true 0 for false",
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
          repurchaseCategory.tableName = `${options.prefix}repurchase_categories`;
        },
        beforeFind: async function (options) {
          repurchaseCategory.tableName = `${options.prefix}repurchase_categories`;
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
      ],
    }
  );
  repurchaseCategory.associate = (models) => {
    repurchaseCategory.hasOne(models.pack, {
      foreignKey: "category_id",
    });
  };
  // repurchaseCategory.sync({force:false})
  return repurchaseCategory;
};

export default repurchaseCategory;
