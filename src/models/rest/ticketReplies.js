const ticketReplies = (sequelize, DataTypes) => {
  const ticketReplies = sequelize.define(
    "ticketReplies",
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
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: pending 1 : read",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ticketReplies.tableName = `${options.prefix}ticket_replies`;
        },
        beforeFind: async function (options) {
          ticketReplies.tableName = `${options.prefix}ticket_replies`;
        },
    },
     // tableName: `${Prefix}ticket_replies`,
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
          name: "ticket_replies_ticket_id_foreign",
          using: "BTREE",
          fields: [{ name: "ticket_id" }],
        },
        {
          name: "ticket_replies_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
  return ticketReplies
};

export default ticketReplies
