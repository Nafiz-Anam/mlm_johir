const userPvDetails = (sequelize, DataTypes) => {
  const userPvDetails = sequelize.define(
    "userPvDetails",
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
      },
      total_pv: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      total_gpv: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          userPvDetails.tableName = `${options.prefix}userpv_details`;
        },
        beforeFind: async function (options) {
          userPvDetails.tableName = `${options.prefix}userpv_details`;
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
          name: "15012_userpv_details_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
  return userPvDetails;
};

export default userPvDetails;
