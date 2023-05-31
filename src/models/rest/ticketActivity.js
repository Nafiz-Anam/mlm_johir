const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const ticketActivity = (sequelize, DataTypes) => {
  const ticketActivity = sequelize.define(
    "ticketActivity",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      ticket_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      doneby: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      doneby_usertype: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      activity: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      if_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      if_reply: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ticketActivity.tableName = `${options.prefix}ticket_activity`;
        },
        beforeFind: async function (options) {
          ticketActivity.tableName = `${options.prefix}ticket_activity`;
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
          name: "ticket_activity_ticket_id_foreign",
          using: "BTREE",
          fields: [{ name: "ticket_id" }],
        },
        {
          name: "ticket_activity_doneby_foreign",
          using: "BTREE",
          fields: [{ name: "doneby" }],
        },
        {
          name: "ticket_activity_doneby_employee_foreign",
          using: "BTREE",
          fields: [{ name: "doneby_employee" }],
        },
      ],
    }
  );
  return ticketActivity;
};

export default ticketActivity;
