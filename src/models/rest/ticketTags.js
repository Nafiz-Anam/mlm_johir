const sequelize = require("sequelize");
const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const ticketTags = (sequelize, DataTypes) => {
  const ticketTags = sequelize.define(
    "ticketTags",
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
      tag_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
            ticketTags.tableName = `${options.prefix}ticket_tags`;
        },
        beforeFind: async function (options) {
            ticketTags.tableName = `${options.prefix}ticket_tags`;
        },
    },
      // tableName: `${Prefix}ticket_tags`,
      timestamps: true,
      underscored : true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "ticket_tags_ticket_id_foreign",
          using: "BTREE",
          fields: [{ name: "ticket_id" }],
        },
        {
          name: "ticket_tags_tag_id_foreign",
          using: "BTREE",
          fields: [{ name: "tag_id" }],
        },
      ],
    }
  );
  ticketTags.associate = (models) => {
    ticketTags.belongsTo(models.tags,{
        foreignKey: 'tag_id'
    })
  }
  return ticketTags
};

export default ticketTags
