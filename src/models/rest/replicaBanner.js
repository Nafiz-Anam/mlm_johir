const replicaBanner = (sequelize, DataTypes) => {
  const replicaBanner = sequelize.define(
    "replicaBanner",
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
        references: {
          model: "users",
          key: "id",
        },
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          replicaBanner.tableName = `${options.prefix}replica_banners`;
        },
        beforeFind: async function (options) {
          replicaBanner.tableName = `${options.prefix}replica_banners`;
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
          name: "replica_banners_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
      ],
    }
  );
  // replicaBanner.sync({force:false})
  return replicaBanner;
};

export default replicaBanner;
