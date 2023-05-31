const donationHistory = (sequelize, DataTypes) => {
  const donationHistory = sequelize.define(
    "donationHistory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      from_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      to_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      amount_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      transaction_concept: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      trans_fee: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "donation_histories_transaction_id_unique",
      },
      level: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      exact_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          donationHistory.tableName = `${options.prefix}donation_histories`;
        },
        beforeFind: async function (options) {
          donationHistory.tableName = `${options.prefix}donation_histories`;
          // sequelize.models.pack.tableName = `${options.prefix}_packages`;
        },
      },
      // tableName: `${Prefix}donationHistory`,
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "donation_histories_transaction_id_unique",
          unique: true,
          using: "BTREE",
          fields: [{ name: "transaction_id" }],
        },
        {
          name: "donation_histories_from_user_foreign",
          using: "BTREE",
          fields: [{ name: "from_user" }],
        },
        {
          name: "donation_histories_to_user_foreign",
          using: "BTREE",
          fields: [{ name: "to_user" }],
        },
        {
          name: "donation_histories_level_foreign",
          using: "BTREE",
          fields: [{ name: "level" }],
        },
        {
          name: "donation_histories_exact_user_foreign",
          using: "BTREE",
          fields: [{ name: "exact_user" }],
        },
      ],
    }
  );
  // donationHistory.sync({force:false})
  return donationHistory;
};

export default donationHistory;
