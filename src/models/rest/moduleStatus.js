const config = require("../../config/config");
const Prefix = config.DB_PREFIX;
const moduleStatus = (sequelize, DataTypes) => {
  const moduleStatus = sequelize.define(
    "moduleStatus",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      mlm_plan: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_pair: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pin_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      product_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      sms_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      mailbox_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      referral_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      ewallet_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      employee_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      payout_release_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      upload_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      sponsor_tree_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      rank_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      rank_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      lang_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      help_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      shuffle_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      // startcounter_status: {
      //   type: DataTypes.TINYINT,
      //   allowNull: false,
      //   defaultValue: 0,
      //   comment: "0 : disabled, 1: enabled",
      // },
      footer_demo_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      captcha_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      sponsor_commission_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      multi_currency_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      lead_capture_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      ticket_system_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      currency_conversion_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      ecom_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      live_chat_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      ecom_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      lead_capture_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      ticket_system_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      autoresponder_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      autoresponder_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      table_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      lcp_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payment_gateway_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      bitcoin_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      repurchase_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      repurchase_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      google_auth_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      package_upgrade: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      package_upgrade_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      maintenance_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      maintenance_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      lang_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      employee_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      sms_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      pin_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      roi_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      basic_demo_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      xup_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      hyip_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      group_pv: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      personal_pv: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      kyc_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      signup_config: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      mail_gun_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      auto_ship_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      downline_count_rank: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      downline_purchase_rank: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      otp_modal: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      gdpr: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      purchase_wallet: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      crowd_fund: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      compression_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      promotion_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      promotion_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      subscription_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      subscription_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      tree_updation: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      cache_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 : disabled, 1: enabled",
      },
      multilang_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for false 1 true",
      },
      default_lang_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "en",
      },
      multi_currency_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for false 1 true",
      },
      default_currency_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "USD",
      },
      replicated_site_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for false 1 true",
      },
      replicated_site_status_demo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for false 1 true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          moduleStatus.tableName = `${options.prefix}module_statuses`;
        },
        beforeFind: async function (options) {
          moduleStatus.tableName = `${options.prefix}module_statuses`;
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
  // moduleStatus.sync({
  //     force: false
  // })
  return moduleStatus;
};

export default moduleStatus;
