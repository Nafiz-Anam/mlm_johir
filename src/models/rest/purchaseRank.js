const purchaseRank = (sequelize, DataTypes) => {
  const purchaseRank = sequelize.define(
    "purchaseRank",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      rank_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "ranks",
          key: "id",
        },
      },
      package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "packages",
          key: "id",
        },
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          purchaseRank.tableName = `${options.prefix}purchase_ranks`;
        },
        beforeFind: async function (options) {
          purchaseRank.tableName = `${options.prefix}purchase_ranks`;
          sequelize.models.user.tableName = `${options.prefix}users`;
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
          name: "purchase_ranks_rank_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "rank_id",
            },
          ],
        },
        {
          name: "purchase_ranks_package_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "package_id",
            },
          ],
        },
      ],
    }
  );
  purchaseRank.associate = (models) => {
    purchaseRank.belongsTo(models.ranks, {
      foreignKey: "rank_id",
    });
    purchaseRank.belongsTo(models.pack, {
      foreignKey: "package_id",
    });
  };
  return purchaseRank;
};

export default purchaseRank;
