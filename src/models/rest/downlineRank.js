const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const downlineRank = (sequelize, DataTypes) => {
  const downlineRank = sequelize.define(
    "downlineRank",
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
          model: "rank_details",
          key: "id",
        },
      },
      downline_rank_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "rank_details",
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
          downlineRank.tableName = `${options.prefix}rank_downline_ranks`;
        },
        beforeFind: async function (options) {
          downlineRank.tableName = `${options.prefix}rank_downline_ranks`;
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
          name: "downline_ranks_rank_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "rank_id",
            },
          ],
        },
        {
          name: "downline_ranks_downline_rank_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "downline_rank_id",
            },
          ],
        },
      ],
    }
  );

  return downlineRank;
};

export default downlineRank;
