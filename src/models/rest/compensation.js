const compensation = (sequelize, DataTypes) => {
  const compensation = sequelize.define(
    "compensation",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      plan_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      sponsor_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      rank_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      referral_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      roi_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      matching_bonus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      pool_bonus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      fast_start_bonus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      performance_bonus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
      sales_commission: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "0 for inactive 1 for active",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          compensation.tableName = `${options.prefix}compensation`;
        },
        beforeFind: async function (options) {
          compensation.tableName = `${options.prefix}compensation`;
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

  // compensation.sync({force:false})
  return compensation;
};

export default compensation;
