const configuration = (sequelize, DataTypes) => {
  const configuration = sequelize.define(
    "configuration",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      tds: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      service_charge: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_price: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_ceiling: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_ceiling_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      product_point_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      end_date: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sms_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reg_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      referral_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      max_pin_count: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_commission_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      depth_ceiling: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      width_ceiling: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      level_commission_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      trans_fee: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      override_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      profile_updation_history: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      xup_level: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      upload_config: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pair_ceiling_monthly: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      // matching_bonus: {
      //     type: DataTypes.STRING(255),
      //     allowNull: false
      // },
      // pool_bonus: {
      //     type: DataTypes.STRING(255),
      //     allowNull: false
      // },
      pool_bonus_percent: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      // fast_start_bonus: {
      //     type: DataTypes.STRING(255),
      //     allowNull: false
      // },
      // performance_bonus: {
      //     type: DataTypes.STRING(255),
      //     allowNull: false
      // },
      sponsor_commission_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      purchase_income_perc: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      commission_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      referral_commission_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      commission_upto_level: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roi_period: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roi_days_skip: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roi_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      skip_blocked_users_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pool_bonus_period: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pool_bonus_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pool_distribution_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      matching_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      matching_upto_level: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sales_criteria: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sales_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sales_level: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      api_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tree_icon_based: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      active_tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      inactive_tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      default_package_tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      default_rank_tree_icon: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      beb_to_usdt_coin_value: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          configuration.tableName = `${options.prefix}configurations`;
        },
        beforeFind: async function (options) {
          configuration.tableName = `${options.prefix}configurations`;
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
  // configuration.sync({
  //     force: false
  // })
  return configuration;
};

export default configuration;
