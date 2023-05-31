const donationLevel = (sequelize, DataTypes) => {
  const donationLevel = sequelize.define(
    "donationLevel",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      level: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          donationLevel.tableName = `${options.prefix}donation_levels`;
        },
        beforeFind: async function (options) {
          donationLevel.tableName = `${options.prefix}donation_levels`;
          // sequelize.models.pack.tableName = `${options.prefix}_packages`;
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
        {
          name: "donation_levels_user_foreign",
          using: "BTREE",
          fields: [{ name: "user" }],
        },
        {
          name: "donation_levels_level_foreign",
          using: "BTREE",
          fields: [{ name: "level" }],
        },
      ],
    }
  );
  // donationLevel.sync({force:false})
  return donationLevel;
};

export default donationLevel;
