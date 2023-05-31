const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const ticketCategories = (sequelize, DataTypes) => {
  const ticketCategories = sequelize.define(
    "ticketCategories",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      category_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ticket_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "0: blocked 1 : active",
      },
      assignee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          ticketCategories.tableName = `${options.prefix}ticket_categories`;
        },
        beforeFind: async function (options) {
          ticketCategories.tableName = `${options.prefix}ticket_categories`;
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
        {
          name: "ticket_categories_assignee_id_foreign",
          using: "BTREE",
          fields: [{ name: "assignee_id" }],
        },
      ],
    }
  );
  ticketCategories.associate = (models) => {
    ticketCategories.hasOne(models.tickets,{
      foreignKey : 'category_id'
    })
  }
  return ticketCategories;
};

export default ticketCategories;
