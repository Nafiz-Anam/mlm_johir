const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const ticketPriority = (sequelize, DataTypes) => {
  const ticketPriority = sequelize.define(
    "ticketPriority",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      priority: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: blocked 1 : active",
      },
      flag_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ticketPriority.tableName = `${options.prefix}ticket_priority`;
        },
        beforeFind: async function (options) {
          ticketPriority.tableName = `${options.prefix}ticket_priority`;
        },
      },
      timestamps: true,
      underscored:true,
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
  ticketPriority.associate = (models) => {
    ticketPriority.hasOne(models.tickets,{
      foreignKey : 'priority_id'
    })
  }
  return ticketPriority
};

export default ticketPriority
