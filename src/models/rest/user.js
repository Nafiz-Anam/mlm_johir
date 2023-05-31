const user = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      ecom_customer_ref_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "first",
      },
      user_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
      },
      password: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      user_rank_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "rankDetails",
          key: "rank_id",
        },
      },
      active: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "yes",
      },
      position: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      leg_position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      father_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
      sponsor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
      first_pair: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "0",
      },
      total_leg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_left_carry: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_right_carry: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      product_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      product_validity: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date_of_joining: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      user_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sponsor_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      register_by_using: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "NA",
      },
      api_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "0",
      },
      default_lang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      default_currency: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      personal_pv: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "0",
      },
      group_pv: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "0",
      },
      binary_leg: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "any",
      },
      goc_key: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      inf_token: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      force_logout: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      google_auth_status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 0,
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      delete_status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 1,
      },
      remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          user.tableName = `${options.prefix}users`;
        },
        beforeFind: async function (options) {
          user.tableName = `${options.prefix}users`;
          sequelize.models.rankDetails.tableName = `${options.prefix}rank_details`;
          sequelize.models.ranks.tableName = `${options.prefix}ranks`;
          sequelize.models.userDetails.tableName = `${options.prefix}user_details`;
          sequelize.models.pack.tableName = `${options.prefix}packages`;
          sequelize.models.userRegistration.tableName = `${options.prefix}users_registrations`;
          sequelize.models.treepath.tableName = `${options.prefix}treepaths`;
          sequelize.models.contacts.tableName = `${options.prefix}contacts`;
          sequelize.models.stairstep.tableName = `${options.prefix}stair_steps`;
          sequelize.models.ocProducts.tableName = `${options.prefix}oc_product`;
          sequelize.models.userWalletBalance.tableName = `${options.prefix}user_wallet_balances`;
          sequelize.models.userBalance.tableName = `${options.prefix}user_balance_amounts`;
        },
      },
      // tableName: `${Prefix}users`,
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
          name: "users_username_unique",
          unique: true,
          using: "BTREE",
          fields: [
            {
              name: "username",
            },
          ],
        },
        {
          name: "users_user_rank_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_rank_id",
            },
          ],
        },
        {
          name: "users_father_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "father_id",
            },
          ],
        },
        {
          name: "users_sponsor_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "sponsor_id",
            },
          ],
        },
        {
          name: "users_product_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "product_id",
            },
          ],
        },
      ],
    }
  );

  user.associate = (models) => {
    user.belongsTo(models.pack, {
      foreignKey: "product_id",
      as: "package",
    });
    user.belongsTo(models.user, {
      foreignKey: "father_id",
      as: "U2",
    });
    user.hasOne(models.userDetails, {
      foreignKey: "user_id",
      sourceKey: "id",
      as: "details",
    });
    user.hasOne(models.stairstep, {
      foreignKey: "id",
    });
    user.hasOne(models.transPassword, {
      foreignKey: "user_id",
      as: "transPass",
    });
    user.belongsTo(models.rankDetails, {
      foreignKey: "user_rank_id",
      as: "rank",
    });
    user.hasMany(models.ewalletHistory, {
      foreignKey: "from_id",
      as: "userWallet",
    });
    user.hasMany(models.ewalletHistory, {
      foreignKey: "user_id",
      as: "fundUser",
    });
    user.hasMany(models.walletHistories, {
      foreignKey: "from_id",
      as: "userCoinWallet",
    });
    user.hasMany(models.walletHistories, {
      foreignKey: "user_id",
      as: "fundCoinUser",
    });
    user.hasMany(models.pinReq, {
      foreignKey: "user_id",
    });
    user.hasMany(models.pinNumbers, {
      foreignKey: "allocated_user",
    });
    user.hasMany(models.pinTransHistory, {
      foreignKey: "to_user",
      as: "user1",
    });
    user.hasMany(models.pinTransHistory, {
      foreignKey: "from_user",
      as: "user2",
    });
    user.hasMany(models.purchaseWalletHistory, {
      foreignKey: "from_user_id",
    });
    user.belongsTo(models.legAmt, {
      foreignKey: "sponsor_id",
      targetKey: "from_id",
    });
    user.hasMany(models.treepath, {
      foreignKey: "descendant",
      as: "T1",
    });
    user.hasMany(models.treepath, {
      foreignKey: "ancestor",
      as: "T2",
    });
    user.hasMany(models.sponsorTree, {
      foreignKey: "descendant",
      as: "S1",
    });
    user.hasOne(models.payoutReleaseRequest, {
      foreignKey: "user_id",
    });
    user.hasOne(models.amountPaid, {
      foreignKey: "user_id",
    });
    user.hasMany(models.fundTransferDetails, {
      foreignKey: "from_id",
      as: "fromUser",
    });
    user.hasMany(models.fundTransferDetails, {
      foreignKey: "to_id",
      as: "toUser",
    });
    user.hasMany(models.crmLeads, {
      foreignKey: "added_by",
    });
    user.hasOne(models.userRegistration, {
      foreignKey: "user_id",
    });
    user.hasMany(models.contacts, {
      foreignKey: "owner_id",
    });
    // user.associate = function(models){
    //     reactMenu.hasMany(models.user,{
    //         foreignKey: 'father_id',
    //     });
    // }
    user.hasMany(models.userBalance, {
      foreignKey: "user_id",
    });
    user.hasMany(models.userWalletBalance, {
      foreignKey: "user_id",
    });
    user.belongsTo(models.ocProducts, {
      foreignKey: "oc_product_id",
      as: "oc_package",
    });
    // user.hasOne(models.ocProducts,{
    //     foreignKey: 'product_id',
    //     sourceKey:'product_id',
    //     as:'oc_package'
    // });
  };

  // user.sync({
  //     force: false
  // });

  return user;
};

export default user;
