const pinReq = (sequelize, DataTypes) => {
  const pinReq = sequelize.define(
    "pinReq",
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
      requested_pin_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      allotted_pin_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      requested_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: "2022-04-20 05:54:07",
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "0 for inactive 1 for active 2 for delete",
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "NA",
      },
      pin_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      read_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "0 for false 1 for true",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pinReq.tableName = `${options.prefix}pin_requests`;
        },
        beforeFind: async function (options) {
          pinReq.tableName = `${options.prefix}pin_requests`;
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
          name: "pin_requests_user_id_foreign",
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
  pinReq.associate = (models) => {
    pinReq.belongsTo(models.user, {
      foreignKey: "user_id",
    });
  };
  // pinReq.sync({force:false})
  return pinReq;
};

export default pinReq;
