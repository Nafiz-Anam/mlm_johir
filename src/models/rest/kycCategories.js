const kycCategories = (sequelize, DataTypes) => {
  const kycCategories = sequelize.define(
    "kycCategories",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      category: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          kycCategories.tableName = `${options.prefix}kyc_categories`;
        },
        beforeFind: async function (options) {
          kycCategories.tableName = `${options.prefix}kyc_categories`;
          // sequelize.models.pack.tableName = `${options.prefix}_packages`;
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
      ],
    }
  );
  kycCategories.associate = (models) => {
    kycCategories.hasMany(models.kycDocs, {
      foreignKey: "id",
      as: "kyccat",
    });
  };
  // kycCategories.sync({force:false})
  return kycCategories;
};

export default kycCategories;
