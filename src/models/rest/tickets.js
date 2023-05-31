const config = require("../../config/config");
const Prefix = config.DB_PREFIX;

const tickets = (sequelize, DataTypes) => {
  const tickets = sequelize.define(
    "tickets",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      track_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      assignee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      // assignee_employee_id: {
      //   type: DataTypes.BIGINT.UNSIGNED,
      //   allowNull: true,
      //   references: {
      //     model: "employees",
      //     key: "id",
      //   },
      // },
      assignee_read_ticket: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: pending 1 : read",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "ticket_categories",
          key: "id",
        },
      },
      priority_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "ticket_priority",
          key: "id",
        },
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "ticket_status",
          key: "id",
        },
      },
      // last_replier: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      // last_replier_employee: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      archive: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0: not archieved 1 : archieved",
      },
      attachments: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      hooks: {
        beforeCreate: async function (instance, options) {
          tickets.tableName = `${options.prefix}tickets`;
        },
        beforeFind: async function (options) {
          tickets.tableName = `${options.prefix}tickets`;
          sequelize.models.ticketStatus.tableName = `${options.prefix}ticket_status`;
          sequelize.models.ticketCategories.tableName = `${options.prefix}ticket_categories`;
          sequelize.models.ticketPriority.tableName = `${options.prefix}ticket_priority`;
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
          name: "tickets_user_id_foreign",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "tickets_assignee_id_foreign",
          using: "BTREE",
          fields: [{ name: "assignee_id" }],
        },
        // {
        //   name: "tickets_assignee_employee_id_foreign",
        //   using: "BTREE",
        //   fields: [{ name: "assignee_employee_id" }],
        // },
        {
          name: "tickets_category_id_foreign",
          using: "BTREE",
          fields: [{ name: "category_id" }],
        },
        {
          name: "tickets_priority_id_foreign",
          using: "BTREE",
          fields: [{ name: "priority_id" }],
        },
        {
          name: "tickets_status_id_foreign",
          using: "BTREE",
          fields: [{ name: "status_id" }],
        },
      ],
    }
  );
  tickets.associate = (models) => {
    tickets.belongsTo(models.ticketStatus, {
      foreignKey: "status_id",
    });
    tickets.belongsTo(models.ticketCategories, {
      foreignKey: "category_id",
    });
    tickets.belongsTo(models.ticketPriority, {
      foreignKey: "priority_id",
    });
  };
  return tickets;
};

export default tickets;
