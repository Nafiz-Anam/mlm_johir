const pinTransHistory = (sequelize, DataTypes) => {
  const pinTransHistory = sequelize.define(
    "pinTransHistory",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      to_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      from_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      epin_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "pin_numbers",
          key: "id",
        },
      },
      ip: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      done_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      activity: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pinTransHistory.tableName = `${options.prefix}epin_transfer_histories`;
        },
        beforeFind: async function (options) {
          pinTransHistory.tableName = `${options.prefix}epin_transfer_histories`;
          sequelize.models.user.tableName = `${options.prefix}users`;
          sequelize.models.userDetails.tableName = `${options.prefix}user_details`;
          sequelize.models.pinNumbers.tableName = `${options.prefix}pin_numbers`;
        },
      },
      // tableName: `${Prefix}epin_transfer_histories`,
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
          name: "epin_transfer_histories_to_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "to_user",
            },
          ],
        },
        {
          name: "epin_transfer_histories_from_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "from_user",
            },
          ],
        },
        {
          name: "epin_transfer_histories_epin_id_foreign",
          using: "BTREE",
          fields: [
            {
              name: "epin_id",
            },
          ],
        },
        {
          name: "epin_transfer_histories_done_by_foreign",
          using: "BTREE",
          fields: [
            {
              name: "done_by",
            },
          ],
        },
      ],
    }
  );
  pinTransHistory.associate = (models) => {
    pinTransHistory.belongsTo(models.user, {
      foreignKey: "to_user",
      as: "user1",
    });
    pinTransHistory.belongsTo(models.user, {
      foreignKey: "from_user",
      as: "user2",
    });
    pinTransHistory.belongsTo(models.pinNumbers, {
      foreignKey: "epin_id",
    });
  };
  // pinTransHistory.sync({force:false})
  return pinTransHistory;
};

export default pinTransHistory;
