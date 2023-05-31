const letterConfig = (sequelize, DataTypes) => {
  const letterConfig = sequelize.define(
    "letterConfig",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      place: {
        type: DataTypes.STRING(255),
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
          letterConfig.tableName = `${options.prefix}letterconfigs`;
        },
        beforeFind: async function (options) {
          letterConfig.tableName = `${options.prefix}letterconfigs`;
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
          name: "letterconfigs_language_id_foreign",
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

  return letterConfig;
};

export default letterConfig;
