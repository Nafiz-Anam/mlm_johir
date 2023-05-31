const pinAmtDetails = (sequelize, DataTypes) => {
  const pinAmtDetails = sequelize.define(
    "pinAmtDetails",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pinAmtDetails.tableName = `${options.prefix}pin_amount_details`;
        },
        beforeFind: async function (options) {
          pinAmtDetails.tableName = `${options.prefix}pin_amount_details`;
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
  // pinAmtDetails.sync({force:false})
  return pinAmtDetails;
};

export default pinAmtDetails;
