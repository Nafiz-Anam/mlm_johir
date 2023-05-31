const rankDetails = (sequelize, DataTypes) => {
  const rankDetails = sequelize.define(
    "rankDetails",
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
      referral_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      party_comm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      personal_pv: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      group_pv: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      downline_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      referral_commission: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      team_member_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pool_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "active",
      },
      delete_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "no",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          rankDetails.tableName = `${options.prefix}rank_details`;
        },
        beforeFind: async function (options) {
          rankDetails.tableName = `${options.prefix}rank_details`;
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
          name: "rank_details_rank_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "rank_id",
            },
          ],
        },
      ],
    }
  );

  rankDetails.associate = (models) => {
    rankDetails.hasOne(models.user, {
      foreignKey: "user_rank_id",
      as: "rank",
    }),
      rankDetails.belongsTo(models.ranks, {
        foreignKey: "rank_id",
        as: "details",
      });
  };
  // rankDetails.sync({
  //     force: false
  // });
  return rankDetails;
};

export default rankDetails;
