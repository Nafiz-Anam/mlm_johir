const donationRates = (sequelize, DataTypes) => {
  const donationRates = sequelize.define(
    "donationRates",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rate: {
        type: DataTypes.DOUBLE(8, 2),
        allowNull: false,
      },
      pm_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      referral_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          donationRates.tableName = `${options.prefix}donation_rates`;
        },
        beforeFind: async function (options) {
          donationRates.tableName = `${options.prefix}donation_rates`;
        },
      },
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  // donationRates.sync({force:false})
  return donationRates;
};

export default donationRates;
