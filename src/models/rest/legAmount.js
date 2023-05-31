const legAmt = (sequelize, DataTypes) => {
  const legAmt = sequelize.define(
    "legAmt",
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
      from_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      total_leg: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      left_leg: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      right_leg: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      amount_payable: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      purchase_wallet: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      amount_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tds: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      service_charge: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      user_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "packages",
          key: "id",
        },
      },
      pair_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      product_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date_of_submission: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: "2022-05-13 11:56:40",
      },
      wallet_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          legAmt.tableName = `${options.prefix}leg_amounts`;
        },
        beforeFind: async function (options) {
          sequelize.models.userDetails.tableName = `${options.prefix}user_details`;
          legAmt.tableName = `${options.prefix}leg_amounts`;
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
          name: "leg_amounts_user_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "user_id",
            },
          ],
        },
        {
          name: "leg_amounts_from_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "from_id",
            },
          ],
        },
        {
          name: "leg_amounts_product_id_foreign",
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
  legAmt.associate = (models) => {
    legAmt.hasOne(models.userDetails, {
      foreignKey: "user_id",
      sourceKey: "from_id",
    });
  };

  // legAmt.sync({force:false})
  return legAmt;
};

export default legAmt;
