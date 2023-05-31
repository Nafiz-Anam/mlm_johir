const donationConfigurations = (sequelize, DataTypes) => {
  const donationConfigurations = sequelize.define(
    "donationConfigurations",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      donation_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          donationConfigurations.tableName = `${options.prefix}donation_configurations`;
        },
        beforeFind: async function (options) {
          donationConfigurations.tableName = `${options.prefix}donation_configurations`;
          // sequelize.models.pack.tableName = `${options.prefix}_packages`;
        },
      },
      // tableName: `${Prefix}donationConfigurations`,
      timestamps: false,
      //   underscored: true,
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
  // donationConfigurations.sync({force:false})
  return donationConfigurations;
};

export default donationConfigurations;
