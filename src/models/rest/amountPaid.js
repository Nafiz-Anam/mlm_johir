const amountPaid = (sequelize, DataTypes) => {
  const amountPaid = sequelize.define(
    "amountPaid",
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
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payout_fee: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      transaction_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: false,
        defaultValue: "0",
        comment: "0 for no 1 for yes",
      },
      payment_method: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      request_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          amountPaid.tableName = `${options.prefix}amount_paids`;
        },
        beforeFind: async function (options) {
          amountPaid.tableName = `${options.prefix}amount_paids`;
          sequelize.models.user.tableName = `${options.prefix}users`;
        },
      },
      // tableName: `${Prefix}amount_paids`,
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
          name: "amount_paids_user_id_foreign",
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
  amountPaid.associate = (models) => {
    amountPaid.belongsTo(models.user, {
      foreignKey: "user_id",
    });
  };

  // amountPaid.sync({force:false})
  return amountPaid;
};

export default amountPaid;
