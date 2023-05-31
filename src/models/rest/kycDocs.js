const kycDocs = (sequelize, DataTypes) => {
  const kycDocs = sequelize.define(
    "kycDocs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "2",
        comment: "0: rejected 1 : approved 2 : pending",
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "NA",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          kycDocs.tableName = `${options.prefix}kyc_docs`;
        },
        beforeFind: async function (options) {
          kycDocs.tableName = `${options.prefix}kyc_docs`;
          sequelize.models.kycCategories.tableName = `${options.prefix}kyc_categories`;
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
          name: "kyc_docs_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
  kycDocs.associate = (models) => {
    kycDocs.belongsTo(models.kycCategories, {
      foreignKey: "type",
      sourceKey: "type",
      as: "kyccat",
    });
  };

  // kycDocs.sync({force:false})
  return kycDocs;
};

export default kycDocs;
