const userDetails = (sequelize, DataTypes) => {
  const userDetails = sequelize.define(
    "userDetails",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      sponsor_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      country_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "countries",
          key: "id",
        },
      },
      state_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      second_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pin: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "NA",
      },
      mobile: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      land_phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      bitcoin_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      account_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ifsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bank: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nacct_holder: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "NA",
      },
      branch: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pan: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      facebbok: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      twitter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bank_info_required: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "1",
        comment: "0 for false 1 for true",
      },
      paypal: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blockchain: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bitgo_wallet: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      upload_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      kyc_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "0",
        comment: "0 for false 1 for true",
      },
      payout_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      banner: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "banner.jpg",
      },
      read_doc_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      read_news_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userDetails.tableName = `${options.prefix}user_details`;
        },
        beforeFind: async function (options) {
          userDetails.tableName = `${options.prefix}user_details`;
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
          name: "user_details_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "user_details_sponsor_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "sponsor_id",
            },
          ],
        },
        {
          name: "user_details_country_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "country_id",
            },
          ],
        },
        {
          name: "user_details_state_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "state_id",
            },
          ],
        },
      ],
    }
  );

  userDetails.associate = (models) => {
    userDetails.belongsTo(models.user, {
      foreignKey: "user_id",
    });
    userDetails.belongsTo(models.legAmt, {
      foreignKey: "user_id",
      targetKey: "user_id",
    });

    userDetails.hasMany(models.mailBoxes, {
      foreignKey: "from_user_id",
      as: "from user",
    });
    userDetails.hasMany(models.mailBoxes, {
      foreignKey: "to_user_id",
      as: "to user",
    });
  };
  // userDetails.sync({
  //     force: false
  // })
  return userDetails;
};

export default userDetails;
