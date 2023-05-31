const termsAndCondition = (sequelize, DataTypes) => {
  const termsAndCondition = sequelize.define(
    "termsAndCondition",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      terms_and_conditions: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      language_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "languages",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          termsAndCondition.tableName = `${options.prefix}terms_and_conditions`;
        },
        beforeFind: async function (options) {
          termsAndCondition.tableName = `${options.prefix}terms_and_conditions`;
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
        {
          name: "terms_and_conditions_language_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "language_id",
            },
          ],
        },
      ],
    }
  );
  // termsAndCondition.sync({force:false})
  return termsAndCondition;
};

export default termsAndCondition;
