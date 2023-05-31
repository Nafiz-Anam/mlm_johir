const documents = (sequelize, DataTypes) => {
  const documents = sequelize.define(
    "documents",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      file_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cat_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "upload_categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          documents.tableName = `${options.prefix}documents`;
        },
        beforeFind: async function (options) {
          documents.tableName = `${options.prefix}documents`;
        },
      },
      // tableName: `${Prefix}_documents`,
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
        {
          name: "documents_cat_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "cat_id",
            },
          ],
        },
      ],
    }
  );

  // documents.sync({force:false})
  return documents;
};

export default documents;
