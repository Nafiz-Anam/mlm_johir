import { Op } from "sequelize";
const pinNumbers = (sequelize, DataTypes) => {
  const pinNumbers = sequelize.define(
    "pinNumbers",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      numbers: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      alloc_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      purchase_status: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: "no",
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "active",
      },
      // used_user: {
      //     type: DataTypes.BIGINT.UNSIGNED,
      //     allowNull: true,
      //     references: {
      //         model: 'users',
      //         key: 'id'
      //     }
      // },
      generated_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      allocated_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      uploaded_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      balance_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      transaction_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          pinNumbers.tableName = `${options.prefix}pin_numbers`;
        },
        beforeFind: async function (options) {
          pinNumbers.tableName = `${options.prefix}pin_numbers`;
          sequelize.models.user.tableName = `${options.prefix}users`;
          sequelize.models.userDetails.tableName = `${options.prefix}user_details`;
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
          name: "pin_numbers_used_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "used_user",
            },
          ],
        },
        {
          name: "pin_numbers_generated_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "generated_user",
            },
          ],
        },
        {
          name: "pin_numbers_allocated_user_foreign",
          using: "BTREE",
          fields: [
            {
              name: "allocated_user",
            },
          ],
        },
      ],
    }
  );
  pinNumbers.addScope("isNotExpired", {
    where: {
      expiry_date: {
        [Op.gt]: Date.now(),
      },
    },
  });
  pinNumbers.addScope("isActivePin", {
    where: {
      [Op.and]: {
        status: "active",
      },
    },
  });
  pinNumbers.addScope("isPurchasePin", {
    where: {
      purchase_status: 1,
    },
  });
  pinNumbers.associate = (models) => {
    pinNumbers.belongsTo(models.user, {
      foreignKey: "allocated_user",
    });
    pinNumbers.hasOne(models.pinTransHistory, {
      foreignKey: "epin_id",
    });
  };
  // pinNumbers.sync({
  //     force: false
  // })
  return pinNumbers;
};

export default pinNumbers;
