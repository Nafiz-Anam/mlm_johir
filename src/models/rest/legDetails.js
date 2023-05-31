const legDetails = (sequelize, DataTypes) => {
  const legDetails = sequelize.define(
    "legDetails",
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
      total_left_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_right_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_left_carry: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_right_carry: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_active: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_inactive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      left_carry_forward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      right_carry_forward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          legDetails.tableName = `${options.prefix}leg_details`;
        },
        beforeFind: async function (options) {
          legDetails.tableName = `${options.prefix}leg_details`;
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
          name: "leg_details_user_id_foreign",
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
  // legDetails.sync({force:false})
  return legDetails;
};

export default legDetails;
