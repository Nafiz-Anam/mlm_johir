const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const ticketStatus = (sequelize, DataTypes) => {
  const ticketStatus = sequelize.define(
    "ticketStatus",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      ticket_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: blocked 1 : active",
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ticketStatus.tableName = `${options.prefix}ticket_status`;
        },
        beforeFind: async function (options) {
          ticketStatus.tableName = `${options.prefix}ticket_status`;
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
      ],
    }
  );
  ticketStatus.associate = (models) => {
    ticketStatus.hasOne(models.tickets,{
      foreignKey : 'status_id'
    })
  }
  return ticketStatus
};

export default ticketStatus
